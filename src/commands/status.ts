import { Command } from "commander";
import chalk from "chalk";
import { loadCurrentSession } from "../data/state";
import { getRelativeTime, dateToDateTimeString } from "../utils";

export function createStatusCommand() {
  return new Command("status")
    .description("Display the status of the current session")
    .action(async () => {
      const state = await loadCurrentSession();

      if (!state) {
        console.log("No project is currently being tracked.");
        return;
      }

      const date = new Date(1000 * state.start);
      console.log(
        `Project ${chalk.magenta.bold(state.project)} started ${getRelativeTime(
          date
        )} (${dateToDateTimeString(date)})`
      );
    });
}
