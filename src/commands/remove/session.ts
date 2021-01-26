import { createCommand } from "../../command";
import { removeSession } from "../../data/session/remove";
import { inquireSession } from "../../input/inquiry/session";
import { parseSessionID } from "../../parsing/session-id";
import * as style from "../../style";
import { logError } from "../../utils";

export function createRemoveSessionCommand() {
  return createCommand("session")
    .arguments("[id]")
    .description(`Remove a ${style.session("session")}`)
    .action(async (id: string | undefined) => {
      const sessionResult = await (id ? parseSessionID(id) : inquireSession());
      if (sessionResult.err) {
        logError(sessionResult.val);
        return;
      }

      const session = sessionResult.val;

      const removeResult = await removeSession(session);
      if (removeResult.err) {
        logError(removeResult.val);
        return;
      }

      console.log(
        `Session ${style.bold(session.id)} was removed successfully.`
      );
    });
}
