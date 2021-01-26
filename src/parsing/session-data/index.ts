import { Result, Ok, Err } from "ts-results";
import { bold } from "../../style";
import { SessionProps } from "../../entities/session";
import { parseTags, parseDate } from "..";
import { parseProject } from "./project";

export type SessionDataInput = {
  project: string;
  start: string;
  end: string;
  tags?: string;
};

export function isSessionDataInput(value: any): value is SessionDataInput {
  return (
    typeof value === "object" &&
    typeof value.project === "string" &&
    typeof value.start === "string" &&
    typeof value.end === "string" &&
    (!value.tags || typeof value.tags === "string")
  );
}

function errorOnNull<T>(name: string, value: T | null): Result<T, string> {
  return value ? Ok(value) : Err(name);
}

export function parseSessionData(
  input: SessionDataInput
): Result<SessionProps, string> {
  const projectParseResult = parseProject(input.project);
  if (projectParseResult.err) return Err(projectParseResult.val);

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

  return Ok({
    project: projectParseResult.val,
    start: new Date(1000 * startSeconds),
    end: new Date(1000 * endSeconds),
    tags: input.tags ? parseTags(input.tags) : undefined,
  });
}
