import { createCommand } from "../command";
import { loadState, storeState } from "../data/state";
import { getRelativeTime, logError } from "../utils";
import * as style from "../style";

export function createCancelCommand() {
  return createCommand("cancel")
    .description(`Stop the current ${style.bold("session")} without saving it`)
    .action(async () => {
      const loadResult = await loadState();
      if (loadResult.err) {
        logError(loadResult.val);
        return;
      }
      const { currentSession } = loadResult.val;

      if (!currentSession) {
        console.log("No session is currently running.");
        return;
      }

      const { project, start } = currentSession;

      await storeState({});

      console.log(
        `Session for project ${style.project(
          project.name
        )} which was started ${getRelativeTime(start)} is now cancelled.`
      );
    });
}
