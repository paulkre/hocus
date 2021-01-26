import { Ok, Err, Result } from "ts-results";
import chalk from "chalk";
import { Session } from "../../entities/session";
import {
  createSessionFileFromDate,
  serializeSession,
  SESSION_MAX_DURATION,
} from "./data";
import { loadSessions } from "./load";

async function findCollidingSession(
  newSession: Session
): Promise<Session | null> {
  const sessions = await loadSessions({
    timespan: {
      from: newSession.start,
      to: newSession.end,
    },
  });

  const { startSeconds: startA, endSeconds: endA } = newSession;
  for (const session of sessions) {
    const { startSeconds: startB, endSeconds: endB } = session;
    if (
      newSession.id !== session.id &&
      ((startA > startB && startA < endB) ||
        (endA > startB && endA < endB) ||
        (startB > startA && startB < endA) ||
        (endB > startA && endB < endA) ||
        (startA === startB && endA === endB))
    )
      return session;
  }

  return null;
}

export async function storeSession(
  session: Session
): Promise<Result<number, string>> {
  if (session.endSeconds - session.startSeconds > SESSION_MAX_DURATION)
    return Err(
      `Session has a duration of over 4 weeks and thus cannot be saved.
Run ${chalk.bold("hocus cancel")} to stop the current session without saving.`
    );

  const secondsNow = Math.floor(new Date().getTime() / 1000);
  if (secondsNow < session.startSeconds || secondsNow < session.endSeconds)
    return Err("Sessions that take place in the future cannot be added.");

  const file = createSessionFileFromDate(session.start);

  const data = (await file.load()) || [];
  const collidingSession = await findCollidingSession(session);
  if (collidingSession)
    return Err(
      `The session could not be saved / updated because at least one other session (${chalk.bold(
        collidingSession.id
      )}) already exists during the same time.`
    );

  const foundIndex = data.findIndex((data) => data.localID === session.localID);
  if (foundIndex >= 0) data.splice(foundIndex, 1);

  data.push(serializeSession(session));

  file.store(
    data.sort((a, b) => a.start - b.start),
    true
  );

  // const project = await loadProject(session.project);
  // if (project) {
  //   const modifiedProject = project.modify({
  //     count: project.data.count + 1,
  //   });
  // }

  return new Ok(data.length);
}
