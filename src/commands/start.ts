import { createCommand } from "../command";
import { loadCurrentSession, storeCurrentSession } from "../data/state";
import { dateToTimeString, parseTagsInput } from "../utils";
import inquirer from "inquirer";
import { runStopAction } from "./stop";
import * as style from "../style";

type Options = {
  tags?: string[];
};

function humanizeTags(tags: string[]): string {
  return tags.length > 1
    ? `${tags
        .slice(0, -1)
        .map((tag) => style.tag(tag))
        .join(", ")} and ${style.tag(tags[tags.length - 1])}`
    : style.tag(tags[0]);
}

export function createStartCommand() {
  return createCommand("start")
    .arguments("[project]")
    .option(
      "-t, --tags <tags...>",
      `${style.tag("Tags")} to be used on the started ${style.project(
        "session"
      )}`
    )
    .description(`Start a new ${style.project("session")}`)
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
          `Project ${style.project(currentSession.project)} already started.`
        );
        if (currentSession.project === project) return;

        const { stopCurrent } = await inquirer.prompt<{ stopCurrent: boolean }>(
          [
            {
              name: "stopCurrent",
              type: "confirm",
              message: `Do you want to stop ${style.project(
                currentSession.project
              )} and start ${style.project(project)}?`,
            },
          ]
        );
        if (!stopCurrent) return;

        await runStopAction();
      }

      const date = new Date();
      console.log(
        `Starting project ${style.project(project)}${
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
