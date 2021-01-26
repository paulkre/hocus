import { createCommand } from "../command";
import { loadState } from "../data/state";
import { getRelativeTime, dateToDateTimeString } from "../utils";
import * as style from "../style";

export function createStatusCommand() {
  return createCommand("status")
    .description(
      `Display the status of the current ${style.session("session")}`
    )
    .action(async () => {
      const { currentSession } = await loadState();

      if (!currentSession) {
        console.log("No project is currently being tracked.");
        return;
      }

      const { project, start } = currentSession;

      console.log(
        `Project ${style.project(project)} started ${getRelativeTime(
          start
        )} (${style.date(dateToDateTimeString(start))})`
      );
    });
}
