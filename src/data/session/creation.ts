import { customAlphabet } from "nanoid";
import { SESSION_START_YEAR, SessionData, Session } from ".";

type SessionBlueprint = Omit<SessionData, "localID">;

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
  const id = `${data.localID}-${dateToID(start)}`;
  const tags = data.tags || [];

  return {
    id,
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
