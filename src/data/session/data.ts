export const SESSION_MAX_DURATION = 2_419_200; // in seconds

import { join as pathJoin } from "path";
import { format as formatDate } from "date-and-time";
import { createFile, File } from "../file";
import { createSession, Session } from "../../entities/session";
import { config } from "../../config";

export type SessionData = {
  localID: string;
  project: string;
  start: number;
  end: number;
  tags?: string[];
};

function isSessionData(value: any): value is SessionData {
  return (
    typeof value === "object" &&
    typeof value.localID === "string" &&
    typeof value.project === "string" &&
    typeof value.start === "number" &&
    typeof value.end === "number"
  );
}

export function serializeSession(v: Session): SessionData {
  return {
    localID: v.localID,
    project: v.project,
    start: v.startSeconds,
    end: v.endSeconds,
    tags: v.tags,
  };
}

export function createSessionFromData(v: SessionData): Session {
  return createSession({
    localID: v.localID,
    project: v.project,
    start: new Date(1000 * v.start),
    end: new Date(1000 * v.end),
    tags: v.tags,
  });
}

export function createSessionFileFromDate(date: Date): File<SessionData[]> {
  return createSessionFile(`${formatDate(date, "YYYY-MM")}.json`);
}

export function createSessionFile(filename: string): File<SessionData[]> {
  return createFile<SessionData[]>(
    pathJoin(config.dataDirectory, filename),
    (value: any): value is SessionData[] =>
      Array.isArray(value) && isSessionData(value[0])
  );
}
