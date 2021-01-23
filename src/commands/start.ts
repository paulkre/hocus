import { Command } from "commander";
import { loadState, storeState } from "../data/state";
import { dateToTimeString } from "../utils";
import chalk from "chalk";
import inquirer from "inquirer";
import { runStopAction } from "./stop";

export function createStartCommand() {
  return new Command("start")
    .arguments("[project]")
    .description("Start tracking time for the given project.")
    .action(async (project?: string) => {
      if (!project) {
        project = (
          await inquirer.prompt<{ project: string }>([
            {
              name: "project",
              message: "Which project will you be working on?",
              default: "hello-world",
            },
          ])
        ).project;
      }

      const state = await loadState();
      if (state) {
        console.log(
          `Project ${chalk.magenta.bold(state.project)} already started.`
        );
        if (state.project === project) return;

        const { stopCurrent } = await inquirer.prompt<{ stopCurrent: boolean }>(
          [
            {
              name: "stopCurrent",
              type: "confirm",
              message: `Do you want to stop ${chalk.magenta.bold(
                state.project
              )} and start ${chalk.magenta.bold(project)}?`,
            },
          ]
        );
        if (!stopCurrent) return;

        await runStopAction();
      }

      const date = new Date();
      storeState({ project, start: Math.floor(date.getTime() / 1000) });
      console.log(
        `Starting project ${chalk.magenta.bold(project)} at ${dateToTimeString(
          date
        )}.`
      );
    });
}
