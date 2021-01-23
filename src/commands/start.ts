import { Command } from "commander";
import { loadCurrentSession, storeCurrentSession } from "../data/state";
import { dateToTimeString, parseTagsInput } from "../utils";
import chalk from "chalk";
import inquirer from "inquirer";
import { runStopAction } from "./stop";

type Options = {
  tags?: string[];
};

const styleTagName = (name: string) => chalk.blue.bold(name);
function humanizeTags(tags: string[]): string {
  return tags.length > 1
    ? `${tags
        .slice(0, -1)
        .map((tag) => styleTagName(tag))
        .join(", ")} and ${styleTagName(tags[tags.length - 1])}`
    : styleTagName(tags[0]);
}

export function createStartCommand() {
  return new Command("start")
    .arguments("[project]")
    .option("-t, --tags <tags...>", "tags to be used on the started session")
    .description("start a new time tracking session")
    .action(async (project: string | undefined, opt: Options) => {
      if (project) project = project.trim();
      const tags = opt.tags ? parseTagsInput(opt.tags) : [];

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

      const currentSession = await loadCurrentSession();
      if (currentSession) {
        console.log(
          `Project ${chalk.magenta.bold(
            currentSession.project
          )} already started.`
        );
        if (currentSession.project === project) return;

        const { stopCurrent } = await inquirer.prompt<{ stopCurrent: boolean }>(
          [
            {
              name: "stopCurrent",
              type: "confirm",
              message: `Do you want to stop ${chalk.magenta.bold(
                currentSession.project
              )} and start ${chalk.magenta.bold(project)}?`,
            },
          ]
        );
        if (!stopCurrent) return;

        await runStopAction();
      }

      const date = new Date();
      console.log(
        `Starting project ${chalk.magenta.bold(project)}${
          tags.length ? ` with tags ${humanizeTags(tags)}` : ""
        } at ${dateToTimeString(date)}.`
      );
      return storeCurrentSession({
        project,
        start: Math.floor(date.getTime() / 1000),
        tags,
      });
    });
}
