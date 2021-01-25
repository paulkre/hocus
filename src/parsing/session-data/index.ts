import { Result, Ok, Err } from "ts-results";
import { bold } from "../../style";
import { SessionBlueprint } from "../../data/session";
import { parseTags, parseDate, parseString } from "..";
import { parseProject } from "./project";

export type SessionDataInput = {
  project: string;
  start: string;
  end: string;
  tags: string;
};

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
  if (dateParseResult.ok) {
    const tmp = dateParseResult.val;
  }

  if (dateParseResult.err)
    return Err(
      `Invalid ${bold(dateParseResult.val)} value for the session's timespan.`
    );

  const [start, end] = dateParseResult.val as Date[];
  const tags = parseTags(input.tags);

  return Ok({
    project: projectParseResult.val,
    start: Math.floor(start.getTime() / 1000),
    end: Math.floor(end.getTime() / 1000),
    tags: tags.length ? tags : undefined,
  });
}
