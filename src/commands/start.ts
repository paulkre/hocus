import inquirer from "inquirer";
import { createCommand } from "../command";
import { loadState, storeState } from "../data/state";
import {
  dateToTimeString,
  getRelativeTime,
  humanizeTags,
  logError,
} from "../utils";
import { parseDate, parseTags } from "../parsing";
import { runStopAction } from "./stop";
import * as style from "../style";
import { createProject, Project } from "../entities/project";
import { resolveProject } from "../resolve/project";
import { Err, Ok, Result } from "ts-results";
import { findSessionByDate, querySessions } from "../data/sessions";

type Options = {
  tags?: string[];
  at?: string;
  gap: boolean;
};

export async function startSession(
  project: Project,
  tags?: string[],
  start?: Date
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

  if (!start) start = new Date();
  console.log(
    `Starting session for project ${style.project(project.name)}${
      tags ? `, tagged with ${humanizeTags(tags)},` : ""
    } at ${style.time(dateToTimeString(start))}.`
  );
  await storeState({ currentSession: { project, start, tags } });
  return Ok(undefined);
}

async function resolveStartDate(
  options: Options
): Promise<Result<Date | undefined, string>> {
  if (options.at && !options.gap)
    return Err(
      `Flags ${style.bold("--at")} and ${style.bold(
        "--no-gap"
      )} cannot both be specified at the same.`
    );

  if (!options.gap) {
    const queryResult = await querySessions({ last: 1 });
    if (queryResult.err) return queryResult;
    const [lastSession] = queryResult.val;
    if (!lastSession) {
      console.log(
        `Flag ${style.bold(
          "--no-gap"
        )} has no effect because there are no previously recorded sessions.`
      );
      return Ok(undefined);
    }
    return Ok(lastSession.end);
  }

  const at = (options.at && parseDate(options.at)) || undefined;
  if (options.at && !at) return Err("Invalid start date / time provided.");
  if (at) {
    if (at.getTime() > Date.now())
      return Err("Start date cannot be in the future.");

    const findResult = await findSessionByDate(at);
    if (findResult.err) return Err(findResult.val);
    if (findResult.val)
      return Err(
        "Start date is already covered by a previously saved session."
      );
  }

  return Ok(at);
}

export function createStartCommand() {
  return createCommand("start")
    .arguments("[project]")
    .option(
      "--at <at>",
      `Start the ${style.bold("session")} at this time / date`
    )
    .option(
      "--no-gap",
      `Start the ${style.bold("session")} with no gap between the last session`
    )
    .option(
      "-t, --tags <tags...>",
      `The ${style.bold("Tags")} to be used on the started ${style.bold(
        "session"
      )} (comma or space separated)`
    )
    .description(`Start a new ${style.bold("session")}`)
    .action(async (projectName: string | undefined, options: Options) => {
      const resolveStartResult = await resolveStartDate(options);
      if (resolveStartResult.err) {
        logError(resolveStartResult.val);
        return;
      }

      const resolveProjectResult = await resolveProject(projectName);
      if (resolveProjectResult.err) {
        logError(resolveProjectResult.val);
        return;
      }

      const startResult = await startSession(
        resolveProjectResult.val,
        options.tags && parseTags(options.tags),
        resolveStartResult.val
      );
      if (startResult.err) logError(startResult.val);
    });
}
