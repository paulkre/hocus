import { Result, Ok, Err } from "ts-results";
import { parseTags, parseDate, parseName } from ".";
import { bold } from "../style";
import { createSession, Session } from "../entities/session";
import { findProject } from "../data/projects";
import { createProject } from "../entities/project";
import { MAX_SESSION_DURATION } from "../data/sessions/data";

export type SessionDataInput = {
  projectName: string;
  start: string;
  end: string;
  tags?: string;
};

export function isSessionDataInput(value: any): value is SessionDataInput {
  return (
    typeof value === "object" &&
    typeof value.projectName === "string" &&
    typeof value.start === "string" &&
    typeof value.end === "string" &&
    (!value.tags || typeof value.tags === "string")
  );
}

function errorOnNull<T>(name: string, value: T | null): Result<T, string> {
  return value ? Ok(value) : Err(name);
}

export async function parseSessionData(
  input: SessionDataInput
): Promise<Result<Session, string>> {
  const projectName = parseName(input.projectName);
  if (!projectName)
    return Err(`"${bold(input.projectName)}" is not valid project name.`);

  const dateParseResult = Result.all<Result<Date, string>[]>(
    errorOnNull("start", parseDate(input.start)),
    errorOnNull("end", parseDate(input.end))
  );

  if (dateParseResult.err)
    return Err(
      `Invalid ${bold(dateParseResult.val)} value for the session's timespan.`
    );

  const [startSeconds, endSeconds] = dateParseResult.val.map((date) =>
    Math.floor(date.getTime() / 1000)
  );

  if (startSeconds > endSeconds)
    return Err("Session cannot start before it ends.");

  if (endSeconds - startSeconds > MAX_SESSION_DURATION)
    return Err(`Sessions cannot be longer than a week.`);

  const secondsNow = Math.floor(new Date().getTime() / 1000);
  if (secondsNow < startSeconds || secondsNow < endSeconds)
    return Err("Sessions cannot take place in the future.");

  return Ok(
    createSession({
      project:
        (await findProject(projectName)) ||
        createProject({ name: projectName }),
      start: new Date(1000 * startSeconds),
      end: new Date(1000 * endSeconds),
      tags: input.tags ? parseTags(input.tags) : undefined,
    })
  );
}
