import { Result, Ok } from "ts-results";
import columnify from "columnify";
import { format } from "date-and-time";
import { createCommand } from "../command";
import { limitString, logError } from "../utils";
import { getProjectData } from "../data/projects/data";
import { outputText } from "../output/text";
import * as style from "../style";

const formatSeconds = (value: number) =>
  format(new Date(1000 * value), "YYYY-MM-DD");

async function listProjects(): Promise<Result<void, string>> {
  const loadResult = await getProjectData();
  if (loadResult.err) return loadResult;

  const text = columnify(
    loadResult.val.reverse().map(({ name, client, sessions }) => ({
      name: style.project(limitString(name, 20)),
      client: client ? style.client(limitString(client, 15)) : "",
      info: sessions
        ? style.light(
            `${style.bold(formatSeconds(sessions.timespan[0]))} - ${style.bold(
              formatSeconds(sessions.timespan[1])
            )} (${style.normal(sessions.count)} sessions)`
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
    .description(`List all ${style.bold("projects")}`)
    .action(async () => {
      const result = await listProjects();
      if (result.err) logError(result.val);
    });
}
