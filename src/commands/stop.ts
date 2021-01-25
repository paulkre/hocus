import { createCommand } from "../command";
import { clearCurrentSession, loadCurrentSession } from "../data/state";
import { storeSession, createSession } from "../data/session";
import { getRelativeTime, logError } from "../utils";
import * as style from "../style";

export async function runStopAction() {
  const currentSession = await loadCurrentSession();

  if (!currentSession) {
    console.log("No project is currently being tracked.");
    return;
  }

  const session = createSession({
    project: currentSession.project,
    start: currentSession.start,
    end: Math.floor(Date.now() / 1000),
    tags: currentSession.tags,
  });

  const result = await storeSession(session);
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
      `(ID: ${session.id})`
    )}`
  );
}

export function createStopCommand() {
  return createCommand("stop")
    .description(`Stop the current ${style.session("session")}`)
    .action(runStopAction);
}
