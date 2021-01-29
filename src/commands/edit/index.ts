import { createCommand } from "../../command";
import { updateSession } from "../../data/sessions";
import {
  dateToDayString,
  dateToTimeString,
  logError,
  humanizeTags,
} from "../../utils";
import { displayChanges } from "./display-changes";
import { parseSessionData } from "../../parsing/session-data";
import { requestSessionDataViaEditor } from "../../input/editor/session-data";
import { resolveSession } from "../../resolve/session";
import * as style from "../../style";

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
      const resolveResult = await resolveSession(id);
      if (resolveResult.err) {
        logError(resolveResult.val);
        return;
      }

      const session = resolveResult.val;

      console.log(`Editing session ${style.bold(session.id)}:`);
      console.log(
        `Recorded for project ${style.project(
          session.project.name
        )} on ${style.date(dateToDayString(session.start))} from ${style.time(
          dateToTimeString(session.start)
        )} to ${style.time(dateToTimeString(session.end))}${
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

      const sessionDataParseResult = await parseSessionData(
        editorInputResult.val
      );

      if (sessionDataParseResult.err) {
        logError(sessionDataParseResult.val);
        return;
      }

      const editedSession = session.modify(sessionDataParseResult.val);

      if (session.isIdenticalTo(editedSession)) {
        console.log("No changes were made.");
        return;
      }

      const saveResult = await updateSession(session, editedSession);
      if (saveResult.err) {
        logError(saveResult.val);
        return;
      }

      displayChanges(session, editedSession);
    });
}
