import { Result, Ok, Err } from "ts-results";
import { createCommand } from "../../command";
import { logError } from "../../utils";
import { createProject } from "../../entities/project";
import { inquireProjectName } from "../../input/inquiry/project-name";
import { editProjectViaEditor } from "../../input/editor/project";
import { parseProject } from "../../parsing/project";
import * as style from "../../style";
import { findProject, updateProject } from "../../data/projects";
import { renameProject } from "../rename/project";
import { displayChanges, ChangeMap } from "./display-changes";

async function editProject(
  projectName?: string
): Promise<Result<void, string>> {
  if (!projectName) projectName = await inquireProjectName();

  const findResult = await findProject(projectName);
  if (findResult.err) return findResult;

  const project = findResult.val;
  if (!project)
    return Err(`Project ${style.bold(projectName)} does not exist.`);

  console.log(`Editing project ${style.project(project.name)}.`);
  console.log();

  const inputResult = await editProjectViaEditor(project);
  if (inputResult.err) return inputResult;

  const parseResult = await parseProject(inputResult.val);
  if (parseResult.err) return parseResult;

  const editedProps = parseResult.val;

  const changes: ChangeMap = new Map();

  if (project.name !== editedProps.name) {
    const renameResult = await renameProject(project.name, editedProps.name);
    console.log();
    if (renameResult.err) return renameResult;
    changes.set("Name", [project.name, style.project(editedProps.name)]);
  }

  if (project.client !== editedProps.client) {
    const updateResult = await updateProject(createProject(editedProps));
    if (updateResult.err) return updateResult;
    changes.set("Client", [
      project.client,
      editedProps.client && style.client(editedProps.client),
    ]);
  }

  if (!changes.size) console.log("No changes were made.");
  else {
    console.log(
      `The following changes to project ${style.project(
        project.name
      )} were made:`
    );
    displayChanges(changes);
  }

  return Ok(undefined);
}

export function createEditProjectCommand() {
  return createCommand("project")
    .arguments("[name]")
    .description(
      `Modify the properties of a ${style.bold(
        "project"
      )} with the given ${style.bold("name")}`
    )
    .action(async (name?: string) => {
      const editResult = await editProject(name);
      if (editResult.err) logError(editResult.val);
    });
}
