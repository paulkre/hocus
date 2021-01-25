import { createCommand } from "../command";
import * as style from "../style";
import { renameProjectInSessions } from "../data/session/rename";

export function createRenameCommand() {
  return createCommand("rename")
    .arguments("<name> <new-name>")
    .description(`Rename a ${style.project("project")}`)
    .action(async (projectName: string, newProjectName: string) => {
      const sessions = await renameProjectInSessions(
        projectName,
        newProjectName
      );

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
