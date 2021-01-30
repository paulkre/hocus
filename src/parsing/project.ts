import { Result, Ok, Err } from "ts-results";
import { ProjectProps } from "../entities/project";
import { parseName } from "../parsing";

export type ProjectInput = ProjectProps;

export async function parseProject(
  input: ProjectInput
): Promise<Result<ProjectProps, string>> {
  const name = parseName(input.name);
  if (!name) return Err(`Invalid project name.`);

  const client = (input.client && parseName(input.client)) || undefined;
  if (input.client && !client) return Err(`Invalid client name.`);

  return Ok({ name, client });
}
