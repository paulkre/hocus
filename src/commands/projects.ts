import { Result, Ok } from "ts-results";
import columnify from "columnify";
import { format } from "date-and-time";
import { createCommand } from "../command";
import { durationToString, limitString, logError } from "../utils";
import { dataToProject, getProjectData } from "../data/projects/data";
import { outputText } from "../output/text";
import * as style from "../style";
import { querySessions } from "../data/sessions";

type Options = { durations?: boolean; client?: string };

const formatSeconds = (value: number) =>
  format(new Date(1000 * value), "DD/MM/YYYY");

async function listProjects(options: Options): Promise<Result<void, string>> {
  const loadResult = await getProjectData();
  if (loadResult.err) return loadResult;

  let data = loadResult.val;
  if (options.client)
    data = data.filter((project) => project.client === options.client);
  data = data.sort((a, b) => {
    if (a.sessions && b.sessions)
      return b.sessions.timespan[1] - a.sessions.timespan[1];
    if (a.sessions && !b.sessions) return -1;
    if (!a.sessions && b.sessions) return 1;
    return a.name.localeCompare(b.name);
  });

  const durations = options.durations
    ? await Promise.all(
        data.map((data) =>
          querySessions({ project: dataToProject(data) }).then(
            (queryResult) => {
              if (queryResult.err) return 0;
              let sum = 0;
              queryResult.val.forEach(({ startSeconds, endSeconds }) => {
                sum += endSeconds - startSeconds;
              });
              return sum;
            }
          )
        )
      )
    : undefined;

  const text = columnify(
    data.map(({ name, client, sessions }, i) => ({
      name: style.project(limitString(name, 20)),
      client: client ? style.client(limitString(client, 15)) : "",
      info: sessions
        ? style.light(
            `${style.bold(formatSeconds(sessions.timespan[0]))} - ${style.bold(
              formatSeconds(sessions.timespan[1])
            )}${
              durations
                ? ` (${style.normal(durationToString(durations[i]))})`
                : ""
            }`
          )
        : "",
    })),
    {
      headingTransform: (value) => style.light(value.toUpperCase()),
      columnSplitter: "    ",
      config: {
        name: {
          minWidth: 8,
        },
        info: {
          showHeaders: false,
        },
      },
    }
  );

  outputText(text);

  return Ok(undefined);
}

export function createProjectsCommand() {
  return createCommand("projects")
    .option(
      "-d, --durations",
      `Show the total time spent on each ${style.bold("project")}`
    )
    .option(
      "-c, --client <client>",
      `The ${style.bold("client")} to use as a filter`
    )
    .description(`List all ${style.bold("projects")}`)
    .action(async (options: Options) => {
      const result = await listProjects(options);
      if (result.err) logError(result.val);
    });
}
