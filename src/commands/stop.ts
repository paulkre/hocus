import { Err, Ok, Result } from "ts-results";
import { createCommand } from "../command";
import { loadState, storeState } from "../data/state";
import { insertSession } from "../data/sessions";
import { getRelativeTime, logError } from "../utils";
import { parseDate } from "../parsing";
import { createSession } from "../entities/session";
import * as style from "../style";

type Options = {
  at?: string;
};

export async function runStopAction(at?: Date): Promise<Result<void, string>> {
  const loadResult = await loadState();
  if (loadResult.err) return loadResult;

  const { currentSession } = loadResult.val;

  if (!currentSession) {
    console.log("No session is currently running.");
    return Ok(undefined);
  }

  if (at && at.getTime() < currentSession.start.getTime())
    return Err("The session's end date cannot be before its start date.");

  const session = createSession({
    project: currentSession.project,
    start: currentSession.start,
    end: at || new Date(),
    tags: currentSession.tags,
  });

  const result = await insertSession(session);
  if (result.err) return result;

  await storeState({});

  console.log(
    `Saving session for project ${style.project(
      currentSession.project.name
    )}, started ${getRelativeTime(currentSession.start)} and stopped ${
      at ? getRelativeTime(at) : style.time("now")
    }. ${style.light(`(ID: ${session.id})`)}`
  );

  return Ok(undefined);
}

export function createStopCommand() {
  return createCommand("stop")
    .option(
      "--at <at>",
      `Stop the ${style.bold("session")} at this time / date`
    )
    .description(`Stop the current ${style.bold("session")}`)
    .action(async (opt: Options) => {
      const at = (opt.at && parseDate(opt.at)) || undefined;
      if (opt.at && !at) {
        logError("Invalid start date / time provided.");
        return;
      }
      if (at && at.getTime() > Date.now()) {
        logError("Stop date cannot be in the future.");
        return;
      }

      const stopResult = await runStopAction(at);
      if (stopResult.err) logError(stopResult.val);
    });
}
