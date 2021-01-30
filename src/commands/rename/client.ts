import { createCommand } from "../../command";
import { Result, Ok } from "ts-results";
import * as style from "../../style";
import { logError } from "../../utils";
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

  const updateResult = await updateProjects(
    projects.map((project) => project.mutate({ client: newClientName }))
  );
  if (updateResult.err) return updateResult;

  console.log(
    `Renamed client ${style.bold(clientName)} to ${style.client(
      newClientName
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
