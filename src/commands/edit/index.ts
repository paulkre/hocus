import { Err, Ok, Result } from "ts-results";
import { createCommand } from "../../command";
import {
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
  dateToInputDefault,
} from "../../utils";
import { displayChanges } from "./display-changes";
import { inquireSessionData } from "./inquire-session-data";
import { inquireSession } from "./inquire-session";
import { parseSessionData, SessionDataInput } from "../../parsing/session-data";

async function resolveSession(id: string): Promise<Result<Session, string>> {
  const session = await loadSingleSession(id);
  return session
    ? new Ok(session)
    : new Err(`Session with ID ${style.bold(id)} could not be found.`);
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
    .action(
      async (id: string | undefined, cmdOptions: Partial<SessionDataInput>) => {
        const flagsExist = Object.keys(cmdOptions).length > 0;
        if (flagsExist && !id) {
          logError("Flags are only permitted if a session ID is provided.");
          return;
        }

        const sessionResult = await (id
          ? resolveSession(id)
          : inquireSession());

        if (sessionResult.err) {
          logError(sessionResult.val);
          return;
        }

        const session = sessionResult.val;

        console.log(`Editing session ${style.bold(session.id)}:`);
        console.log(
          `Recorded for project ${style.project(
            session.project
          )} on ${style.date(dateToDayString(session.start))} from ${style.time(
            dateToTimeString(session.start)
          )} to ${style.time(dateToTimeString(session.end))}${
            session.tags.length
              ? ` with tag${session.tags.length > 1 ? "s" : ""} ${humanizeTags(
                  session.tags
                )}`
              : ""
          }.`
        );
        console.log();

        const defaultOptions: SessionDataInput = {
          project: session.project,
          start: dateToInputDefault(session.start),
          end: dateToInputDefault(session.end),
          tags: session.tags,
        };

        const sessionDataParseResult = parseSessionData(
          flagsExist
            ? {
                ...defaultOptions,
                ...cmdOptions,
              }
            : await inquireSessionData(defaultOptions)
        );

        if (sessionDataParseResult.err) {
          logError(sessionDataParseResult.val);
          return;
        }

        const editedSession = restoreSession({
          ...sessionDataParseResult.val,
          localID: session.data.localID,
        });

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
      }
    );
}
