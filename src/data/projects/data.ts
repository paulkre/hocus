import { Result, Ok, Err } from "ts-results";
import { join as joinPaths } from "path";
import { getFile } from "../file";
import { config } from "../../config";
import { createProject, Project, ProjectProps } from "../../entities/project";

type ProjectDataProps = {
  sessionCount?: number;
  timespan?: [number, number];
};

export type ProjectData = ProjectProps & ProjectDataProps;

export function isProjectData(value: any): value is ProjectData {
  return typeof value === "object" && typeof value.name === "string";
}

export function dataToProject(data: ProjectData): Project {
  return createProject({ ...data });
}

export function projectToData(
  project: Project,
  props?: ProjectDataProps
): ProjectData {
  return {
    ...project.serialize(),
    ...props,
  };
}

export const projectsFile = getFile<ProjectData[]>(
  joinPaths(config.dataDirectory, "projects-000.json"),
  (value: any): value is ProjectData[] =>
    Array.isArray(value) && isProjectData(value[0])
);

export async function mutateProjects(
  mutateFn: (data: ProjectData[]) => ProjectData[]
): Promise<Result<void, string>> {
  let data = await (await projectsFile.load()).unwrapOr<ProjectData[]>([]);

  data = mutateFn(data);

  if (data)
    await projectsFile.store(
      data.sort((a, b) => a.name.localeCompare(b.name)),
      true
    );

  return Ok(undefined);
}

export async function saveProjectData(
  data: ProjectData
): Promise<Result<void, string>> {
  return mutateProjects((items) => {
    const index = items.findIndex((item) => item.name === data.name);
    if (index >= 0) items.splice(index, 1);
    items.push(data);
    return items;
  });
}

export async function findProjectData(
  name: string
): Promise<ProjectData | undefined> {
  const projects = (await projectsFile.load()).unwrapOr<ProjectData[]>([]);
  return projects.find((project) => project.name === name);
}
