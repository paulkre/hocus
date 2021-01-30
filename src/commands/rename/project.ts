import { createCommand } from "../../command";
import * as style from "../../style";
import { updateSessionsUnsafe } from "../../data/sessions";
import { logError } from "../../utils";
import {
  deleteProject,
  findProject,
  getSessionsForProject,
  handleAddedSessions,
  handleRemovedSessions,
} from "../../data/projects";
import { resolveProject } from "../../resolve/project";
import { Result } from "ts-results";

export function createRenameProjectCommand() {
  return createCommand("project")
    .arguments("<name> <new-name>")
    .description(`Rename a ${style.bold("project")}`)
    .action(async (projectName: string, newProjectName: string) => {
      const findResult = await findProject(projectName);
      if (findResult.err) {
        logError(findResult.val);
        return;
      }

      if (!findResult.val) {
        console.log(
          `Project ${style.project(
            projectName
          )} cannot be renamed because it does not exist.`
        );
        return;
      }
      const project = findResult.val;

      const resolveTargetProjectResult = await resolveProject(newProjectName);
      if (resolveTargetProjectResult.err) {
        logError(resolveTargetProjectResult.val);
        return;
      }
      const targetProject = resolveTargetProjectResult.val;

      if (project.name === targetProject.name) {
        console.log(
          `Project ${style.project(project.name)} already has this name.`
        );
        return;
      }

      const queryResult = await getSessionsForProject(project);
      if (queryResult.err) {
        logError(queryResult.val);
        return;
      }
      const sessions = queryResult.val;

      if (!sessions.length) {
        console.log(
          `No sessions found for project ${style.project(projectName)}.`
        );
        return;
      }

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

      const cleanupResult = Result.all(
        await handleRemovedSessions(project),
        await handleAddedSessions(sessions, targetProject)
      );
      if (cleanupResult.err) {
        logError(cleanupResult.val);
        return;
      }

      await deleteProject(project);

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
