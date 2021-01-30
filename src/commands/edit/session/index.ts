import { createCommand } from "../../../command";
import { updateSession } from "../../../data/sessions";
import { logError } from "../../../utils";
import { displayChanges } from "./display-changes";
import { parseSessionData } from "../../../parsing/session-data";
import { requestSessionDataViaEditor } from "../../../input/editor/session-data";
import { resolveSession } from "../../../resolve/session";
import * as style from "../../../style";

export async function editSession(id?: string) {
  const resolveResult = await resolveSession(id);
  if (resolveResult.err) {
    logError(resolveResult.val);
    return;
  }
  const session = resolveResult.val;

  if (!session) {
    console.log("Session could not be found.");
    return;
  }

  console.log(`Editing session ${style.session(session.id)}.`);
  console.log();

  const editorInputResult = await requestSessionDataViaEditor(session);
  if (editorInputResult.err) {
    logError(editorInputResult.val);
    return;
  }

  const sessionDataParseResult = await parseSessionData(editorInputResult.val);

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
}

export function createEditSessionCommand() {
  return createCommand("session")
    .arguments("[id]")
    .description(
      `Modify the attributes of a ${style.bold(
        "session"
      )} with the given ${style.bold("ID")}`
    )
    .action(editSession);
}
