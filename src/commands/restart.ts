import { createCommand } from "../command";
import { logError } from "../utils";
import * as style from "../style";
import { startSession } from "./start";
import { querySessions } from "../data/sessions";

export function createRestartCommand() {
  return createCommand("restart")
    .description(`Restart the most recently recorded ${style.bold("session")}`)
    .action(async () => {
      const queryResult = await querySessions({ last: 1 });
      if (queryResult.err) {
        logError(queryResult.val);
        return;
      }
      const [lastSession] = queryResult.val;
      if (!lastSession) {
        logError("No session found to restart.");
        return;
      }

      const startResult = await startSession(
        lastSession.project,
        lastSession.tags
      );
      if (startResult.err) logError(startResult.val);
    });
}
