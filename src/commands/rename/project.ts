import { createCommand } from "../../command";
import * as style from "../../style";
import { querySessions, renameProjectInSessions } from "../../data/sessions";
import { logError } from "../../utils";
import { findProject } from "../../data/projects";
import { createProject } from "../../entities/project";

export function createRenameProjectCommand() {
  return createCommand("project")
    .arguments("<name> <new-name>")
    .description(`Rename a ${style.project("project")}`)
    .action(async (projectName: string, newProjectName: string) => {
      const project =
        (await findProject(projectName)) ||
        createProject({ name: projectName, count: 0 });

      // if (!project) {
      //   logError(`Project ${style.project(projectName)} does not exist.`);
      //   return;
      // }

      const sessions = await querySessions({ project: project.name });
      if (!sessions.length) {
        console.log(
          `No sessions found for project ${style.project(projectName)}.`
        );
        return;
      }

      const renameResult = await renameProjectInSessions(
        projectName,
        newProjectName
      );

      if (renameResult.err) {
        logError(renameResult.val);
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
