import { join as pathJoin } from "path";
import { format as formatDate } from "date-and-time";
import { Ok, Err, Result } from "ts-results";
import chalk from "chalk";
import { SESSION_MAX_DURATION, Session, SessionData } from ".";
import { createFile } from "../file";
import { config } from "../../config";
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

  const {
    id,
    data: { start, end },
  } = newSession;
  for (const session of sessions) {
    const {
      id: otherID,
      data: { start: otherStart, end: otherEnd },
    } = session;
    if (
      id !== otherID &&
      ((start > otherStart && start < otherEnd) ||
        (end > otherStart && end < otherEnd) ||
        (otherStart > start && otherStart < end) ||
        (otherEnd > start && otherEnd < end) ||
        (start === otherStart && end === otherEnd))
    )
      return session;
  }

  return null;
}

export async function storeSession(
  session: Session
): Promise<Result<number, string>> {
  const { data } = session;

  if (data.end - data.start > SESSION_MAX_DURATION)
    return Err(
      `Session has a duration of over 4 weeks and thus cannot be saved.
Run ${chalk.bold("hocus cancel")} to stop the current session without saving.`
    );

  const secondsNow = Math.floor(new Date().getTime() / 1000);
  if (secondsNow < data.start || secondsNow < data.end)
    return Err("Sessions that take place in the future cannot be added.");

  const filename = `${formatDate(new Date(1000 * data.start), "YYYY-MM")}.json`;
  const file = createFile(pathJoin(config.dataDirectory, filename));

  const sessions: SessionData[] = (await file.load()) || [];
  const collidingSession = await findCollidingSession(session);
  if (collidingSession)
    return Err(
      `The session could not be saved / updated because at least one other session (${chalk.bold(
        collidingSession.id
      )}) already exists during the same time.`
    );

  const foundIndex = sessions.findIndex(
    (session) => session.localID === data.localID
  );
  if (foundIndex >= 0) sessions.splice(foundIndex, 1);

  sessions.push(data);

  file.store(
    sessions.sort((a, b) => a.start - b.start),
    true
  );

  return new Ok(sessions.length);
}
