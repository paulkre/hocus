import { Command } from "commander";
import chalk from "chalk";
import { loadState } from "../data/state";
import { getRelativeTime, dateToDateTimeString } from "../utils";

export function createStatusCommand() {
  return new Command("status")
    .description("Display the status of the current session")
    .action(async () => {
      const state = await loadState();

      if (!state) {
        console.log("No projects currently running.");
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
