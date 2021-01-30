import { createCommand } from "../command";
import { loadState, storeState } from "../data/state";
import { insertSession } from "../data/sessions";
import { getRelativeTime, logError } from "../utils";
import { createSession } from "../entities/session";
import * as style from "../style";
import { Ok, Result } from "ts-results";

export async function runStopAction(): Promise<Result<void, string>> {
  const loadResult = await loadState();
  if (loadResult.err) return loadResult;

  const { currentSession } = loadResult.val;

  if (!currentSession) {
    console.log("No session is currently running.");
    return Ok(undefined);
  }

  const session = createSession({
    project: currentSession.project,
    start: currentSession.start,
    end: new Date(),
    tags: currentSession.tags,
  });

  const result = await insertSession(session);
  if (result.err) return result;

  await storeState({});

  console.log(
    `Stopping session for project ${style.project(
      currentSession.project.name
    )} which was started ${getRelativeTime(currentSession.start)}. ${style.id(
      `(ID: ${session.id})`
    )}`
  );

  return Ok(undefined);
}

export function createStopCommand() {
  return createCommand("stop")
    .description(`Stop the current ${style.bold("session")}`)
    .action(async () => {
      const stopResult = await runStopAction();
      if (stopResult.err) logError(stopResult.val);
    });
}
