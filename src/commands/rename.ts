import { createCommand } from "../command";
import * as style from "../style";
import { renameProjectInSessions } from "../data/session/rename";
import { logError } from "../utils";

export function createRenameCommand() {
  return createCommand("rename")
    .arguments("<name> <new-name>")
    .description(`Rename a ${style.project("project")}`)
    .action(async (projectName: string, newProjectName: string) => {
      const renameResult = await renameProjectInSessions(
        projectName,
        newProjectName
      );

      if (renameResult.err) {
        logError(renameResult.val);
        return;
      }
      const sessions = renameResult.val;

      if (!sessions.length) {
        console.log(
          `No sessions found for project ${style.project(projectName)}.`
        );
        return;
      }

      console.log(
        `Renamed project ${style.project(projectName)} to ${style.project(
          newProjectName
        )}.`
      );

      console.log(
        `${style.bold(sessions.length.toString())} session${
          sessions.length > 1 ? "s" : ""
        } modified.`
      );
    });
}
