import { customAlphabet } from "nanoid";
import { SESSION_START_YEAR, SessionData, Session, SessionBlueprint } from ".";

function dateToID(date: Date) {
  const monthNum =
    12 * (date.getFullYear() - SESSION_START_YEAR) + date.getMonth();
  return monthNum.toString(36).toUpperCase();
}

const createRandomID = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  4
);

export function restoreSession(data: SessionData): Session {
  const start = new Date(1000 * data.start);
  const end = new Date(1000 * data.end);
  const dateID = dateToID(start);
  const tags = data.tags || [];

  return {
    id: `${data.localID}-${dateID}`,
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
