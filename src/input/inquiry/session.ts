import { Result, Ok, Err } from "ts-results";
import { prompt } from "inquirer";
import { querySessions, findSession } from "../../data/sessions";
import { dateToDayString, dateToTimeString } from "../../utils";
import * as style from "../../style";
import { Session } from "../../entities/session";

export async function inquireSession(): Promise<
  Result<Session | undefined, string>
> {
  const latestSessions = await querySessions({ last: 5 });

  if (!latestSessions.length) return new Err("No sessions available to edit.");

  const { id } = await prompt<{ id: string }>([
    {
      type: "list",
      name: "id",
      message: `Select a session (${style.bold("ID")}):`,
      choices: latestSessions
        .sort((a, b) => b.startSeconds - a.startSeconds)
        .map(({ id, project, start, end, tags }) => ({
          value: id,
          name: `${style.bold(id)}: ${dateToDayString(start)} from ${style.bold(
            dateToTimeString(start)
          )} to ${style.bold(dateToTimeString(end))} (${style.bold(
            project.name
          )})${
            tags ? ` [${tags.map((tag) => style.bold(tag)).join(", ")}]` : ""
          }`,
        })),
    },
  ]);
  console.log();

  return Ok(await findSession(id));
}
