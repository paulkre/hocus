import { Result, Ok } from "ts-results";
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
  notes?: string;
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

export function sessionToData(v: Session): SessionData {
  return {
    localID: v.localID,
    project: v.project.name,
    start: v.startSeconds,
    end: v.endSeconds,
    tags: v.tags,
    notes: v.notes,
  };
}

export async function dataToSession(
  v: SessionData
): Promise<Result<Session, string>> {
  const findResult = await findProject(v.project);
  if (findResult.err) return findResult;

  return Ok(
    createSession({
      localID: v.localID,
      project: findResult.val || createProject({ name: v.project }),
      start: new Date(1000 * v.start),
      end: new Date(1000 * v.end),
      tags: v.tags,
      notes: v.notes,
    })
  );
}

export const dateToSessionFilename = (date: Date) =>
  `${formatDate(date, "YYYY-MM")}.json`;

export function getSessionsFile(value: string | Session): File<SessionData[]> {
  const filename =
    typeof value === "string" ? value : dateToSessionFilename(value.start);
  return getFile<SessionData[]>(
    pathJoin(config.dataDirectory, filename),
    (value: any): value is SessionData[] =>
      Array.isArray(value) && (!value[0] || isSessionData(value[0])),
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
