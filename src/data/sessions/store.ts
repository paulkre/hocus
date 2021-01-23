import { format as formatDate } from "date-and-time";
import { customAlphabet } from "nanoid";
import { Ok, Err, Result } from "ts-results";
import chalk from "chalk";
import { createFile } from "../file";
import { createSession, Session, SessionData } from "./session";
import { SESSION_MAX_DURATION } from ".";

type SessionDataBlueprint = Omit<SessionData, "localID">;

const createRandomID = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  4
);

function findCollidingSession(
  blueprint: SessionDataBlueprint,
  frames: SessionData[]
): SessionData | null {
  for (const frame of frames) {
    if (
      (blueprint.start > frame.start && blueprint.start < frame.end) ||
      (blueprint.end > frame.start && blueprint.end < frame.end)
    )
      return frame;
  }
  return null;
}

export async function storeSession(
  blueprint: SessionDataBlueprint
): Promise<Result<Session, string>> {
  if (blueprint.end - blueprint.start > SESSION_MAX_DURATION)
    return new Err(
      `The new frame has a duration of over 4 weeks and thus cannot be recorded.
Run ${chalk.bold("hocus cancel")} to stop the current session without saving.`
    );

  const filename = `${formatDate(
    new Date(1000 * blueprint.start),
    "YYYY-MM"
  )}.json`;
  const file = createFile<SessionData[]>(filename);

  const sessions = (await file.load()) || [];
  const collidingSession = findCollidingSession(blueprint, sessions);
  if (collidingSession)
    return new Err(
      `New frame overlaps with frame ${chalk.bold(
        createSession(collidingSession).id
      )} and thus cannot be added`
    );

  let localID: string;
  do {
    localID = createRandomID();
  } while (sessions.find((frame) => frame.localID === localID));

  const sessionData: SessionData = {
    ...blueprint,
    localID,
  };
  sessions.push(sessionData);

  file.store(
    sessions.sort((a, b) => a.start - b.start),
    true
  );

  return new Ok(createSession(sessionData));
}
