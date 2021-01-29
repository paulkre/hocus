import { createCommand } from "../../command";
import * as style from "../../style";
import { updateSessionsUnsafe } from "../../data/sessions";
import { logError } from "../../utils";
import {
  findProject,
  getSessionsForProject,
  handleAddedSessions,
  handleRemovedSessions,
} from "../../data/projects";
import { createProject } from "../../entities/project";

export function createRenameProjectCommand() {
  return createCommand("project")
    .arguments("<name> <new-name>")
    .description(`Rename a ${style.project("project")}`)
    .action(async (projectName: string, newProjectName: string) => {
      const project =
        (await findProject(projectName)) ||
        createProject({ name: projectName });

      const sessions = await getSessionsForProject(project);
      if (!sessions.length) {
        console.log(
          `No sessions found for project ${style.project(projectName)}.`
        );
        return;
      }

      const targetProject =
        (await findProject(newProjectName)) ||
        createProject({ name: newProjectName });

      const renameResult = await updateSessionsUnsafe(
        sessions.map((session) =>
          session.modify({
            project: targetProject,
          })
        )
      );
      if (renameResult.err) {
        logError(renameResult.val);
        return;
      }

      await handleAddedSessions(sessions, targetProject);
      await handleRemovedSessions(project);

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
