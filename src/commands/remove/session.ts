import { createCommand } from "../../command";
import { deleteSession } from "../../data/sessions";
import * as style from "../../style";
import { logError } from "../../utils";
import { resolveSession } from "../../resolve/session";

export function createRemoveSessionCommand() {
  return createCommand("session")
    .arguments("[id]")
    .description(`Remove a ${style.session("session")}`)
    .action(async (id: string | undefined) => {
      const resolveResult = await resolveSession(id);
      if (resolveResult.err) {
        logError(resolveResult.val);
        return;
      }

      const session = resolveResult.val;
      if (!session) {
        console.log(`Session could not be found.`);
        return;
      }

      await deleteSession(session);

      console.log(
        `Session ${style.bold(session.id)} was removed successfully.`
      );
    });
}
