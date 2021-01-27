import { Result, Ok, Err } from "ts-results";
import { ProjectData, projectsFile } from "./data";
import { createProject, Project } from "../../entities/project";

export async function findProject(name: string): Promise<Project | null> {
  const projects = (await projectsFile.load()).unwrapOr<ProjectData[]>([]);
  const data = projects.find((project) => project.name === name);
  return data ? createProject(data) : null;
}

async function mutateProjects(
  mutateFn: (data: ProjectData[]) => Result<ProjectData[], string>
): Promise<Result<void, string>> {
  const dataResult = await projectsFile.load();
  if (dataResult.err) return Err(dataResult.val);
  const data = dataResult.val;

  const mutateResult = mutateFn(data);
  if (mutateResult.err) return Err(mutateResult.val);

  projectsFile.store(mutateResult.val, true);

  return Ok(undefined);
}

export async function storeProject(
  project: Project
): Promise<Result<void, string>> {
  return mutateProjects((data) => {
    const index = data.findIndex((data) => data.name === project.name);
    if (index >= 0) data.splice(index, 1);
    data.push(project);
    return Ok(data.sort((a, b) => a.name.localeCompare(b.name)));
  });
}

export async function removeProject(
  project: Project
): Promise<Result<void, string>> {
  return mutateProjects((data) => {
    const index = data.findIndex((data) => data.name === project.name);
    if (index < 0) return Err(`Project ${project.name} does not exist.`);
    data.splice(index, 1);
    return Ok(data);
  });
}
