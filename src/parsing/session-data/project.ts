import { Result, Ok, Err } from "ts-results";
import { parseDate, parseString } from "..";
import { bold } from "../../style";

export function parseProject(value: string): Result<string, string> {
  const dateParseResult = parseDate(value);
  if (dateParseResult) return Err("Project name cannot be a date.");
  const project = parseString(value);
  if (!project) return Err(`Invalid value for ${bold("project")} name.`);
  return Ok(value);
}
