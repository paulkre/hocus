import { join as joinPaths } from "path";
import { createFile } from "../file";
import { ProjectProps } from "../../entities/project";
import { config } from "../../config";

export type ProjectData = ProjectProps;

export function isProjectData(value: any): value is ProjectData {
  return (
    typeof value === "object" &&
    typeof value.name === "string" &&
    typeof value.count === "number"
  );
}

export const projectsFile = createFile<ProjectData[]>(
  joinPaths(config.dataDirectory, "projects-001.json"),
  (value: any): value is ProjectData[] =>
    Array.isArray(value) && isProjectData(value[0])
);
