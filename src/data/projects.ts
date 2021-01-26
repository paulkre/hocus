import { Result, Ok, Err } from "ts-results";
import { join as pathJoin } from "path";
import { createFile } from "../data/file";
import { config } from "../config";
import {
  createProject,
  isProjectData,
  Project,
  ProjectProps,
} from "../entities/project";

// const file = createFile<ProjectProps[]>(
//   pathJoin(config.dataDirectory, "projects.json"),
//   (value: any): value is ProjectProps[] =>
//     Array.isArray(value) && isProjectData(value[0])
// );

// export async function loadProject(
//   name: string
// ): Promise<Result<Project | undefined, string>> {
//   const result = await file.load();
//   if (result.err) return Err(result.val);
//   const data = result.val.find((project) => project.name === name);
//   return Ok(createProject(data));
// }
