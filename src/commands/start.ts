import inquirer from "inquirer";
import { createCommand } from "../command";
import { loadState, storeState } from "../data/state";
import {
  dateToTimeString,
  getRelativeTime,
  humanizeTags,
  logError,
} from "../utils";
import { parseTags } from "../parsing";
import { runStopAction } from "./stop";
import * as style from "../style";
import { Project } from "../entities/project";
import { resolveProject } from "../resolve/project";
import { Ok, Result } from "ts-results";

type Options = {
  tags?: string[];
  client?: string;
};

export async function startSession(
  project: Project,
  tags?: string[]
): Promise<Result<void, string>> {
  const loadResult = await loadState();
  if (loadResult.err) return loadResult;

  const { currentSession } = loadResult.val;
  if (currentSession) {
    console.log(
      `Project ${style.project(
        currentSession.project.name
      )} was already started ${style.time(
        getRelativeTime(currentSession.start)
      )}.`
    );
    if (currentSession.project.name === project.name) return Ok(undefined);

    const { stopCurrent } = await inquirer.prompt<{ stopCurrent: boolean }>([
      {
        name: "stopCurrent",
        type: "confirm",
        message: `Do you want to stop ${style.project(
          currentSession.project.name
        )} and start ${style.project(project.name)}?`,
      },
    ]);
    if (!stopCurrent) return Ok(undefined);

    return runStopAction();
  }

  const start = new Date();
  console.log(
    `Starting session for project ${style.project(project.name)}${
      tags ? ` with tags ${humanizeTags(tags)}` : ""
    } at ${style.time(dateToTimeString(start))}.`
  );
  await storeState({ currentSession: { project, start, tags } });
  return Ok(undefined);
}

export function createStartCommand() {
  return createCommand("start")
    .arguments("[project]")
    .option(
      "-t, --tags <tags...>",
      `The ${style.bold("Tags")} to be used on the started ${style.bold(
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

      const startResult = await startSession(
        resolveResult.val,
        opt.tags && parseTags(opt.tags)
      );
      if (startResult.err) logError(startResult.val);
    });
}
