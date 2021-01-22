import { Command } from "commander";
import { loadState, storeState } from "../data/state";
import { getRelativeTime, dateToTimeString } from "../utils";
import chalk from "chalk";

export function createStartCommand() {
  return new Command("start")
    .arguments("<project>")
    .description("Start tracking time for the given project.")
    .action(async (project: string) => {
      const state = await loadState();

      if (state) {
        console.log(
          `Already started project ${chalk.magenta.bold(
            state.project
          )} ${getRelativeTime(new Date(1000 * state.start))}.`
        );
        return;
      }

      const date = new Date();
      storeState({ project, start: Math.floor(date.getTime() / 1000) });
      console.log(
        `Starting project ${chalk.magenta.bold(project)} at ${dateToTimeString(
          date
        )}`
      );
    });
}
