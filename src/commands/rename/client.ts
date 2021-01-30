import { Result, Ok, Err } from "ts-results";
import { createCommand } from "../../command";
import * as style from "../../style";
import { logError } from "../../utils";
import { parseName } from "../../parsing";
import { queryProjectsByClient, updateProjects } from "../../data/projects";

export async function renameClient(
  clientName: string,
  newClientName: string
): Promise<Result<void, string>> {
  const queryResult = await queryProjectsByClient(clientName);
  if (queryResult.err) return queryResult;

  const projects = queryResult.val;
  if (!projects.length) {
    console.log(
      `Client ${style.client(
        clientName
      )} could not be renamed because it does not exist.`
    );
    return Ok(undefined);
  }

  const parsedNewName = parseName(newClientName);
  if (!parsedNewName) return Err("New client name is invalid.");

  if (clientName === parsedNewName) {
    console.log(`Client ${style.client(clientName)} already has this name.`);
    return Ok(undefined);
  }

  const updateResult = await updateProjects(
    projects.map((project) => project.mutate({ client: parsedNewName }))
  );
  if (updateResult.err) return updateResult;

  console.log(
    `Renamed client ${style.light(clientName)} to ${style.client(
      parsedNewName
    )}.`
  );

  console.log(
    `${style.bold(projects.length.toString())} project${
      projects.length > 1 ? "s" : ""
    } modified.`
  );

  return Ok(undefined);
}

export function createRenameClientCommand() {
  return createCommand("client")
    .arguments("<name> <new-name>")
    .description(`Rename a ${style.bold("client")}`)
    .action(async (clientName: string, newClientName: string) => {
      const renameResult = await renameClient(clientName, newClientName);
      if (renameResult.err) logError(renameResult.val);
    });
}
