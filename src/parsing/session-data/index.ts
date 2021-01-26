import { Result, Ok, Err } from "ts-results";
import { bold } from "../../style";
import { SessionBlueprint } from "../../data/session";
import { parseTags, parseDate, parseString } from "..";
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
    Object.keys(value).length === 4 &&
    typeof value.project === "string" &&
    typeof value.start === "string" &&
    typeof value.end === "string" &&
    typeof value.tags === "string"
  );
}

function errorOnNull<T>(name: string, value: T | null): Result<T, string> {
  return value ? Ok(value) : Err(name);
}

export function parseSessionData(
  input: SessionDataInput
): Result<SessionBlueprint, string> {
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

  const [start, end] = dateParseResult.val.map((date) =>
    Math.floor(date.getTime() / 1000)
  );

  if (start > end) return Err("Session cannot start before it ends.");

  return Ok({
    project: projectParseResult.val,
    start,
    end,
    tags: input.tags ? parseTags(input.tags) : undefined,
  });
}
