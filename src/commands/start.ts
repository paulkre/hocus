import inquirer from "inquirer";
import { createCommand } from "../command";
import { loadState, storeState } from "../data/state";
import { dateToTimeString, humanizeTags, logError } from "../utils";
import { parseTags } from "../parsing";
import { runStopAction } from "./stop";
import * as style from "../style";
import { resolveProject } from "../resolve/project";

type Options = {
  tags?: string[];
};

export function createStartCommand() {
  return createCommand("start")
    .arguments("[project]")
    .option(
      "-t, --tags <tags...>",
      `${style.bold("Tags")} to be used on the started ${style.bold(
        "session"
      )} (comma or space separated)`
    )
    .description(`Start a new ${style.bold("session")}`)
    .action(async (projectName: string | undefined, opt: Options) => {
      const resolveResult = await resolveProject(projectName);
      if (resolveResult.err) {
        logError(resolveResult.val);
        return;
      }

      const project = resolveResult.val;
      const tags = opt.tags && parseTags(opt.tags.join(" "));

      const loadResult = await loadState();
      if (loadResult.err) {
        logError(loadResult.val);
        return;
      }

      const { currentSession } = loadResult.val;
      if (currentSession) {
        console.log(
          `Project ${style.project(
            currentSession.project.name
          )} already started.`
        );
        if (currentSession.project === project) return;

        const { stopCurrent } = await inquirer.prompt<{ stopCurrent: boolean }>(
          [
            {
              name: "stopCurrent",
              type: "confirm",
              message: `Do you want to stop ${style.project(
                currentSession.project.name
              )} and start ${style.project(project.name)}?`,
            },
          ]
        );
        if (!stopCurrent) return;

        await runStopAction();
      }

      const start = new Date();
      console.log(
        `Starting session for project ${style.project(project.name)}${
          tags ? ` with tags ${humanizeTags(tags)}` : ""
        } at ${style.time(dateToTimeString(start))}.`
      );
      return storeState({ currentSession: { project, start, tags } });
    });
}
