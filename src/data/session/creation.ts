import { customAlphabet } from "nanoid";
import { SessionData, Session, SessionBlueprint } from ".";
import { dateToID } from "./date";

const createRandomID = customAlphabet(
  "0123456789abcdefghijklmnopqrstuvwxyz",
  4
);

export function restoreSession(data: SessionData): Session {
  const start = new Date(1000 * data.start);
  const end = new Date(1000 * data.end);
  const dateID = dateToID(start);
  const tags = data.tags || [];

  return {
    id: `${dateID}${data.localID}`,
    dateID,
    project: data.project,
    start,
    end,
    tags,
    totalSeconds: data.end - data.start,
    data,
  };
}

export function createSession(blueprint: SessionBlueprint): Session {
  return restoreSession({
    ...blueprint,
    localID: createRandomID(),
  });
}
