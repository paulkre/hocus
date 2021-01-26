import { Result, Ok, Err } from "ts-results";
import { prompt } from "inquirer";
import { loadSessions, loadSingleSession } from "../../data/session";
import { dateToDayString, dateToTimeString } from "../../utils";
import * as style from "../../style";
import { Session } from "../../data/session";

export async function inquireSession(): Promise<Result<Session, string>> {
  const latestSessions = await loadSessions({ last: 5 });

  if (!latestSessions.length) return new Err("No sessions available to edit.");

  const { id } = await prompt<{ id: string }>([
    {
      type: "list",
      name: "id",
      message: `Select a session (${style.bold("ID")}):`,
      choices: latestSessions
        .sort((a, b) => b.data.start - a.data.start)
        .map(({ id, project, start, end, tags }) => ({
          value: id,
          name: `${style.bold(id)}: ${dateToDayString(start)} from ${style.bold(
            dateToTimeString(start)
          )} to ${style.bold(dateToTimeString(end))} (${style.bold(project)})${
            tags.length
              ? ` [${tags.map((tag) => style.bold(tag)).join(", ")}]`
              : ""
          }`,
        })),
    },
  ]);
  console.log();

  return new Ok((await loadSingleSession(id))!);
}
