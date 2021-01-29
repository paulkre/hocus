import { createCommand } from "../command";
import { loadState } from "../data/state";
import { getRelativeTime, dateToDateTimeString, logError } from "../utils";
import * as style from "../style";

export function createStatusCommand() {
  return createCommand("status")
    .description(
      `Display the status of the current ${style.session("session")}`
    )
    .action(async () => {
      const loadResult = await loadState();
      if (loadResult.err) {
        logError(loadResult.val);
        return;
      }
      const { currentSession } = loadResult.val;

      if (!currentSession) {
        console.log("No project is currently being tracked.");
        return;
      }

      const { project, start } = currentSession;

      console.log(
        `Project ${style.project(project.name)} started ${getRelativeTime(
          start
        )} (${style.date(dateToDateTimeString(start))})`
      );
    });
}
