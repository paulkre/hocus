import { Command } from "commander";
import { clearCurrentSession, loadCurrentSession } from "../data/state";
import { storeSession } from "../data/session";
import { getRelativeTime, logError } from "../utils";
import chalk from "chalk";

export async function runStopAction() {
  const currentSession = await loadCurrentSession();

  if (!currentSession) {
    console.log("No project is currently being tracked.");
    return;
  }

  const result = await storeSession({
    project: currentSession.project,
    start: currentSession.start,
    end: Math.floor(Date.now() / 1000),
    tags: currentSession.tags,
  });

  if (result.err) {
    logError(result.val);
    return;
  }

  await clearCurrentSession();
  const date = new Date(1000 * currentSession.start);
  console.log(
    `Stopping project ${chalk.magenta.bold(
      currentSession.project
    )} which was started ${getRelativeTime(date)}. ${chalk.grey.bold(
      `(ID: ${result.val.id})`
    )}`
  );
}

export function createStopCommand() {
  return new Command("stop")
    .description("stop the current session")
    .action(runStopAction);
}
