import { Command } from "commander";
import { loadCurrentSession } from "../data/state";
import { getRelativeTime, dateToDateTimeString } from "../utils";
import * as style from "../style";

export function createStatusCommand() {
  return new Command("status")
    .description("display the status of the current session")
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
        )} (${dateToDateTimeString(date)})`
      );
    });
}
