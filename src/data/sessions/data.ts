import { join as pathJoin } from "path";
import { existsSync, readdirSync } from "fs";
import { format as formatDate } from "date-and-time";

export const MAX_SESSION_DURATION = 2_419_200; // in seconds

import { getFile, File } from "../file";
import { createSession, Session } from "../../entities/session";
import { config } from "../../config";
import { findProject } from "../projects";
import { createProject } from "../../entities/project";

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
    project: v.project.name,
    start: v.startSeconds,
    end: v.endSeconds,
    tags: v.tags,
  };
}

export async function createSessionFromData(v: SessionData): Promise<Session> {
  return createSession({
    localID: v.localID,
    project:
      (await findProject(v.project)) || createProject({ name: v.project }),
    start: new Date(1000 * v.start),
    end: new Date(1000 * v.end),
    tags: v.tags,
  });
}

export const dateToSessionFilename = (date: Date) =>
  `${formatDate(date, "YYYY-MM")}.json`;

export function getSessionsFile(value: string | Session): File<SessionData[]> {
  const filename =
    typeof value === "string" ? value : dateToSessionFilename(value.start);
  return getFile<SessionData[]>(
    pathJoin(config.dataDirectory, filename),
    (value: any): value is SessionData[] =>
      Array.isArray(value) && isSessionData(value[0]),
    []
  );
}

export function getSessionFilenames(): string[] {
  return existsSync(config.dataDirectory)
    ? readdirSync(config.dataDirectory, {
        withFileTypes: true,
      })
        .filter(
          (dirent) =>
            dirent.isFile() && dirent.name.match(/^\d\d\d\d-\d\d\.json$/)
        )
        .map((dirent) => dirent.name)
        .sort((a, b) => a.localeCompare(b))
    : [];
}
