import { createCommand } from "../../command";
import {
  restoreSession,
  sessionsAreEqual,
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
import { inquireSessionData } from "../../input/inquiry/session-data";
import { inquireSession } from "../../input/inquiry/session";
import { parseSessionData, SessionDataInput } from "../../parsing/session-data";
import { parseSession } from "../../parsing/session";
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
      const sessionResult = await (id ? parseSession(id) : inquireSession());

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
          session.tags.length
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
    });
}
