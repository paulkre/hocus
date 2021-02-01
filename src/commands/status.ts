import { createCommand } from "../command";
import { loadState } from "../data/state";
import {
  dateToTimeString,
  getRelativeTime,
  humanizeTags,
  logError,
} from "../utils";
import * as style from "../style";

export function createStatusCommand() {
  return createCommand("status")
    .description(`Display the status of the current ${style.bold("session")}`)
    .action(async () => {
      const loadResult = await loadState();
      if (loadResult.err) {
        logError(loadResult.val);
        return;
      }
      const { currentSession } = loadResult.val;

      if (!currentSession) {
        console.log("No session is currently running.");
        return;
      }

      const { project, start, tags } = currentSession;

      console.log(
        `Session for project ${style.project(project.name)}${
          tags ? `, tagged with ${humanizeTags(tags)},` : ""
        } started ${getRelativeTime(start)} (${style.bold(
          dateToTimeString(start)
        )}).`
      );
    });
}
