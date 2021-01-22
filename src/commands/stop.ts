import { Command } from "commander";
import { clearState, loadState } from "../data/state";
import { recordFrame } from "../data/frames";
import { getRelativeTime, logError } from "../utils";
import chalk from "chalk";

export function createStopCommand() {
  return new Command("stop")
    .description("Stop the current tracking session.")
    .action(async () => {
      const state = await loadState();

      if (!state) {
        console.log("There are currently no projects started");
        return;
      }

      const result = await recordFrame({
        project: state.project,
        start: state.start,
        end: Math.floor(Date.now() / 1000),
      });

      if (result.err) {
        logError(result.val);
        return;
      }

      clearState();
      const date = new Date(1000 * state.start);
      console.log(
        `Stopping project ${chalk.magenta.bold(
          state.project
        )} which was started ${getRelativeTime(date)} ${chalk.grey.bold(
          `(ID: ${result.val.id})`
        )}`
      );
    });
}
