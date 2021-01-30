import { Result, Ok, Err } from "ts-results";
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
import { parseName } from "../../parsing";

export async function renameProject(
  projectName: string,
  newProjectName: string
): Promise<Result<void, string>> {
  const findResult = await findProject(projectName);
  if (findResult.err) return findResult;

  if (!findResult.val) {
    console.log(
      `Project ${style.project(
        projectName
      )} cannot be renamed because it does not exist.`
    );
    return Ok(undefined);
  }
  const project = findResult.val;

  const parsedNewName = parseName(newProjectName);
  if (!parsedNewName) return Err("New project name is invalid.");

  if (project.name === parsedNewName) {
    console.log(
      `Project ${style.project(project.name)} already has this name.`
    );
    return Ok(undefined);
  }

  const targetProject = project.mutate({ name: parsedNewName });

  const queryResult = await getSessionsForProject(project);
  if (queryResult.err) return queryResult;

  const sessions = queryResult.val;

  const renameResult = await updateSessionsUnsafe(
    sessions.map((session) =>
      session.mutate({
        project: targetProject,
      })
    )
  );
  if (renameResult.err) return renameResult;

  const cleanupResult = Result.all(
    await handleRemovedSessions(project),
    await handleAddedSessions(sessions, targetProject)
  );
  if (cleanupResult.err) return cleanupResult;

  await deleteProject(project);

  console.log(
    `Renamed project ${style.light(projectName)} to ${style.project(
      parsedNewName
    )}.`
  );

  console.log(
    `${style.bold(sessions.length.toString())} session${
      sessions.length > 1 ? "s" : ""
    } modified.`
  );

  return Ok(undefined);
}

export function createRenameProjectCommand() {
  return createCommand("project")
    .arguments("<name> <new-name>")
    .description(`Rename a ${style.bold("project")}`)
    .action(async (projectName: string, newProjectName: string) => {
      const renameResult = await renameProject(projectName, newProjectName);
      if (renameResult.err) logError(renameResult.val);
    });
}
