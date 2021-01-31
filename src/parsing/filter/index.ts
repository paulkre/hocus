import { Result, Ok, Err } from "ts-results";
import { Filter } from "../../data/sessions/query/data";
import { parseTimespan, TimespanInput } from "./timespan";
import { parseName, parseTags } from "..";
import { Project } from "../../entities/project";
import { findProject } from "../../data/projects";

type FilterInput = TimespanInput & {
  project?: string;
  tags?: string | string[];
  client?: string;
};

export async function parseFilter({
  project: projectName,
  tags,
  client,
  ...timespanInput
}: FilterInput): Promise<Result<Filter, string>> {
  const timespanParseResult = parseTimespan(timespanInput);
  if (timespanParseResult.err) return Err(timespanParseResult.val);

  let project: Project | undefined = undefined;
  if (projectName) {
    const parsedProjectName = parseName(projectName);
    if (!parsedProjectName) return Err("Invalid project name.");
    const findResult = await findProject(parsedProjectName);
    if (findResult.err) return findResult;
    project = findResult.val;
  }

  return Ok({
    project,
    tags: tags ? parseTags(tags) : undefined,
    client: client && parseName(client),
    timespan: timespanParseResult.val,
  });
}
