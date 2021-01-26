import { createCommand } from "../../command";
import { loadSingleSession, storeSession } from "../../data/session";
import * as style from "../../style";
import {
  dateToDayString,
  dateToTimeString,
  logError,
  humanizeTags,
} from "../../utils";
import { displayChanges } from "./display-changes";
import { inquireSession } from "../../input/inquiry/session";
import { parseSessionData } from "../../parsing/session-data";
import { requestSessionDataViaEditor } from "../../input/editor/session-data";

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
    .action(async (id: string | undefined) => {
      const sessionResult = await (id
        ? loadSingleSession(id)
        : inquireSession());

      if (sessionResult.err) {
        logError(sessionResult.val);
        return;
      }

      const session = sessionResult.val;

      console.log(`Editing session ${style.bold(session.id)}:`);
      console.log(
        `Recorded for project ${style.project(session.project)} on ${style.date(
          dateToDayString(session.start)
        )} from ${style.time(dateToTimeString(session.start))} to ${style.time(
          dateToTimeString(session.end)
        )}${
          session.tags
            ? ` with tag${session.tags.length > 1 ? "s" : ""} ${humanizeTags(
                session.tags
              )}`
            : ""
        }.`
      );
      console.log();

      const editorInputResult = await requestSessionDataViaEditor(session);
      if (editorInputResult.err) {
        logError(editorInputResult.val);
        return;
      }

      const sessionDataParseResult = parseSessionData(editorInputResult.val);

      if (sessionDataParseResult.err) {
        logError(sessionDataParseResult.val);
        return;
      }

      const editedSession = session.modify(sessionDataParseResult.val);

      if (session.isIdenticalTo(editedSession)) {
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
