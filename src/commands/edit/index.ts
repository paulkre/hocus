import { format as formatDate } from "date-and-time";
import { Err, Ok, Result } from "ts-results";
import { prompt } from "inquirer";
import { createCommand } from "../../command";
import {
  loadSessions,
  loadSingleSession,
  restoreSession,
  sessionsAreEqual,
  Session,
  storeSession,
} from "../../data/session";
import * as style from "../../style";
import {
  dateToDayString,
  dateToTimeString,
  logError,
  humanizeTags,
  parseDateInput,
  parseTagsInput,
  dateToInputDefault,
} from "../../utils";
import { displayChanges } from "./display-changes";
import { inquireOptions } from "./inquire-options";

async function loadLastSessionID() {
  const result = await loadSessions({ last: 1 });
  return result.length ? result[0].id : null;
}

export type Options = {
  project: string;
  start: string;
  end: string;
  tags: string;
};

function parseOptions(
  input: Options,
  { data: { localID } }: Session
): Result<Session, string> {
  const start = Math.floor(
    parseDateInput(input.start, "start").getTime() / 1000
  );
  const end = Math.floor(parseDateInput(input.end, "end").getTime() / 1000);

  if (start > end) return new Err("Session cannot end before it starts.");

  return new Ok(
    restoreSession({
      localID,
      project: input.project,
      start,
      end,
      tags: parseTagsInput(input.tags.split(" ")),
    })
  );
}

export function createEditCommand() {
  return createCommand("edit")
    .arguments("[id]")
    .option(
      "--project <project>",
      "The new project name for the selected session"
    )
    .option("--start <start>", "The new start date for the selected session")
    .option("--end <end>", "The new end date for the selected session")
    .option(
      "--tags <tags...>",
      "The new tags for the selected session (comma or space separated)"
    )
    .description(
      `Modify the attributes of a ${style.project(
        "session"
      )} with the given ${style.bold("ID")}`
    )
    .action(async (id: string | undefined, cmdOptions: Partial<Options>) => {
      const flagsExist = Object.keys(cmdOptions).length > 0;
      if (!flagsExist && !id) {
        logError("Flags are only allowed if a session ID is provided.");
        return;
      }

      if (!id) {
        const lastID = await loadLastSessionID();

        id = (
          await prompt<{ id: string }>([
            {
              name: "id",
              message: `Which session (${style.bold(
                "ID"
              )}) do you want to edit?`,
              default: lastID,
            },
          ])
        ).id;
      }

      const session = await loadSingleSession(id);
      if (!session) {
        logError(`Session with ID ${style.bold(id)} could not be found.`);
        return;
      }

      console.log(`Editing session ${style.bold(id)}:`);
      console.log(
        `Recorded for project ${style.project(
          session.project
        )} on ${dateToDayString(session.start)} from ${dateToTimeString(
          session.start
        )} to ${dateToTimeString(session.end)}${
          session.tags.length
            ? ` with tag${session.tags.length > 1 ? "s" : ""} ${humanizeTags(
                session.tags
              )}`
            : ""
        }.`
      );
      console.log();

      const defaultOptions: Options = {
        project: session.project,
        start: dateToInputDefault(session.start),
        end: dateToInputDefault(session.end),
        tags: session.tags ? session.tags.join(", ") : "",
      };

      const parseResult = flagsExist
        ? parseOptions(
            {
              ...defaultOptions,
              ...cmdOptions,
            },
            session
          )
        : parseOptions(await inquireOptions(defaultOptions), session);

      if (parseResult.err) {
        logError(parseResult.val);
        return;
      }

      const editedSession = parseResult.val;

      if (sessionsAreEqual(session, editedSession)) {
        console.log("No changes were made.");
        return;
      }

      const storeResult = await storeSession(editedSession);
      if (storeResult.err) {
        logError(storeResult.val);
        return;
      }

      displayChanges(session, editedSession);
    });
}
