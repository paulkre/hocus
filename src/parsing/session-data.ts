import { Result, Ok, Err } from "ts-results";
import { parseTags, parseDate } from ".";
import { bold } from "../style";
import { SessionProps } from "../entities/session";
import { MAX_SESSION_DURATION } from "../data/sessions/data";
import { findProject } from "../data/projects";
import { createProject } from "../entities/project";
import { parseName } from "../parsing";

export type SessionDataInput = {
  projectName: string;
  start: string;
  end: string;
  tags?: string | string[];
};

function errorOnNull<T>(name: string, value: T | null): Result<T, string> {
  return value ? Ok(value) : Err(name);
}

export async function parseSessionData(
  input: SessionDataInput
): Promise<Result<SessionProps, string>> {
  const projectName = parseName(input.projectName);
  if (!projectName) return Err(`Invalid project name.`);

  const findProjectResult = await findProject(projectName);
  if (findProjectResult.err) return findProjectResult;

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

  return Ok({
    project: findProjectResult.val || createProject({ name: projectName }),
    start: new Date(1000 * startSeconds),
    end: new Date(1000 * endSeconds),
    tags: input.tags ? parseTags(input.tags) : undefined,
  });
}
