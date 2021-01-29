import { Result, Ok, Err } from "ts-results";
import { findProject } from "../data/projects";
import { createProject, Project } from "../entities/project";
import { inquireProjectName } from "../input/inquiry/project-name";
import { parseName } from "../parsing";

export async function resolveProject(
  projectName: string | undefined
): Promise<Result<Project, string>> {
  if (!projectName) projectName = await inquireProjectName();
  projectName = parseName(projectName);
  if (!projectName) return Err(`Invalid project name.`);

  const findResult = await findProject(projectName);
  if (findResult.err) return findResult;

  return Ok(findResult.val || createProject({ name: projectName }));
}
