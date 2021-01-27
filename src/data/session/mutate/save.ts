import { Result, Ok, Err } from "ts-results";
import { Session } from "../../../entities/session";
import {
  MAX_SESSION_DURATION,
  mutateSessions,
  serializeSession,
  getSessionsFile,
} from "../data";
import { querySessions } from "../query";
import { bold } from "../../../style";

async function findCollidingSession(
  newSession: Session
): Promise<Session | null> {
  const sessions = await querySessions({
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

export async function saveSession(
  session: Session
): Promise<Result<void, string>> {
  if (session.endSeconds - session.startSeconds > MAX_SESSION_DURATION)
    return Err(
      `Session has a duration of over 4 weeks and thus cannot be saved.
Run ${bold("hocus cancel")} to stop the current session without saving.`
    );

  const secondsNow = Math.floor(new Date().getTime() / 1000);
  if (secondsNow < session.startSeconds || secondsNow < session.endSeconds)
    return Err("Sessions that take place in the future cannot be added.");

  const collidingSession = await findCollidingSession(session);
  if (collidingSession)
    return Err(
      `The session could not be saved / updated because at least one other session (${bold(
        collidingSession.id
      )}) already exists during the same time.`
    );

  return mutateSessions(
    (data) => {
      const index = data.findIndex((data) => data.localID === session.localID);
      if (index >= 0) data.splice(index, 1);
      data.push(serializeSession(session));
      return data;
    },
    [getSessionsFile(session)]
  );
}
