import { createCommand } from "../command";
import { loadState, storeState } from "../data/state";
import { insertSession } from "../data/sessions";
import { getRelativeTime, logError } from "../utils";
import { createSession } from "../entities/session";
import * as style from "../style";

export async function runStopAction() {
  const { currentSession } = await loadState();

  if (!currentSession) {
    console.log("No session is currently running.");
    return;
  }

  const session = createSession({
    project: currentSession.project,
    start: currentSession.start,
    end: new Date(),
    tags: currentSession.tags,
  });

  const result = await insertSession(session);
  if (result.err) {
    logError(result.val);
    return;
  }

  await storeState({});

  console.log(
    `Stopping session for project ${style.project(
      currentSession.project.name
    )} which was started ${getRelativeTime(currentSession.start)}. ${style.id(
      `(ID: ${session.id})`
    )}`
  );
}

export function createStopCommand() {
  return createCommand("stop")
    .description(`Stop the current ${style.session("session")}`)
    .action(runStopAction);
}
