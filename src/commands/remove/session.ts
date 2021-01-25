import { createCommand } from "../../command";
import { loadSingleSession } from "../../data/session";
import { removeSession } from "../../data/session/remove";
import * as style from "../../style";
import { logError } from "../../utils";

export function createRemoveSessionCommand() {
  return createCommand("session")
    .arguments("<id>")
    .description(`Remove a ${style.session("session")}`)
    .action(async (id: string) => {
      const session = await loadSingleSession(id);
      if (!session) {
        logError(`A session with ID ${style.bold(id)} does not exist.`);
        return;
      }

      const removeResult = await removeSession(session);
      if (removeResult.err) {
        logError(removeResult.val);
        return;
      }

      console.log(`Session ${style.bold(id)} was removed successfully.`);
    });
}
