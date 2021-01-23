import { createCommand } from "../command";
import { clearCurrentSession, loadCurrentSession } from "../data/state";
import { storeSession } from "../data/session";
import { getRelativeTime, logError } from "../utils";
import * as style from "../style";

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
    `Stopping project ${style.project(
      currentSession.project
    )} which was started ${getRelativeTime(date)}. ${style.id(
      `(ID: ${result.val.id})`
    )}`
  );
}

export function createStopCommand() {
  return createCommand("stop")
    .description(`Stop the current ${style.project("session")}`)
    .action(runStopAction);
}
