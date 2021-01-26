import { createCommand } from "../command";
import { loadCurrentSession } from "../data/state";
import { getRelativeTime, dateToDateTimeString } from "../utils";
import * as style from "../style";

export function createStatusCommand() {
  return createCommand("status")
    .description(
      `Display the status of the current ${style.session("session")}`
    )
    .action(async () => {
      const state = await loadCurrentSession();

      if (!state) {
        console.log("No project is currently being tracked.");
        return;
      }

      const date = new Date(1000 * state.start);
      console.log(
        `Project ${style.project(state.project)} started ${getRelativeTime(
          date
        )} (${style.date(dateToDateTimeString(date))})`
      );
    });
}
