import { join as pathJoin } from "path";
import { createFile } from "../data/file";
import { config } from "../config";
import {
  createProject,
  isProjectData,
  Project,
  ProjectProps,
} from "../entities/project";

const file = createFile<ProjectProps[]>(
  pathJoin(config.dataDirectory, "projects.json"),
  (value: any): value is ProjectProps[] =>
    Array.isArray(value) && isProjectData(value[0])
);

export async function loadProject(name: string): Promise<Project | null> {
  const projects = await file.load();
  if (!projects) return null;
  const data = projects.find((project) => project.name === name);
  return data ? createProject(data) : null;
}

export async function storeProject(project: Project) {
  const projects = (await file.load()) as ProjectProps[];
}
