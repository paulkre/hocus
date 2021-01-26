import inquirer from "inquirer";
import { createCommand } from "../command";
import { loadState, storeState } from "../data/state";
import { dateToTimeString, humanizeTags, logError } from "../utils";
import { parseTags } from "../parsing";
import { runStopAction } from "./stop";
import * as style from "../style";
import { inquireProjectName } from "../input/inquiry/project-name";

type Options = {
  tags?: string[];
};

export function createStartCommand() {
  return createCommand("start")
    .arguments("[project]")
    .option(
      "-t, --tags <tags...>",
      `${style.tag("Tags")} to be used on the started ${style.project(
        "session"
      )} (comma or space separated)`
    )
    .description(`Start a new ${style.session("session")}`)
    .action(async (project: string | undefined, opt: Options) => {
      if (project) project = project.trim();
      const tags = opt.tags && parseTags(opt.tags.join(" "));

      if (!project) project = await inquireProjectName();
      if (!project) {
        logError("Project has to be specified.");
        return;
      }

      const { currentSession } = await loadState();
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

      const start = new Date();
      console.log(
        `Starting project ${style.project(project)}${
          tags ? ` with tags ${humanizeTags(tags)}` : ""
        } at ${style.time(dateToTimeString(start))}.`
      );
      return storeState({ currentSession: { project, start, tags } });
    });
}
