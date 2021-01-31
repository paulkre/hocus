import { Result, Ok, Err } from "ts-results";
import { Filter } from "../data/sessions/query/data";
import { parseName, parseTags } from ".";
import { Project } from "../entities/project";
import { findProject } from "../data/projects";
import { Timespan } from "../data/sessions/query/timespan";
import { FilterOptions } from "../input/fliter";
import { parseDate } from "../parsing";
import { bold } from "../style";

const constructErrorMessage = (name: string) =>
  `The ${bold(name)} value for the requested timespan is invalid`;

function parseTimespan(input: FilterOptions): Result<Timespan, string> {
  const to = parseDate(input.to || new Date().toString());
  if (!to) return Err(constructErrorMessage("to"));

  const from = parseDate(
    input.from || new Date(to.getTime() - 604_800_000).toString()
  ); // default is from 1 week ago
  if (!from) return Err(constructErrorMessage("from"));

  return Ok({ from, to });
}

export async function parseFilter(
  filterOptions: FilterOptions
): Promise<Result<Filter, string>> {
  const { project: projectName, tags, client, all } = filterOptions;

  let timespan: Timespan | undefined = undefined;
  if (!all) {
    const timespanParseResult = parseTimespan(filterOptions);
    if (timespanParseResult.err) return Err(timespanParseResult.val);
    timespan = timespanParseResult.val;
  }

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
    timespan,
  });
}
