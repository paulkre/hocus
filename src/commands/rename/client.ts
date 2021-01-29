import { createCommand } from "../../command";
import * as style from "../../style";
import { logError } from "../../utils";
import { queryProjectsByClient, updateProjects } from "../../data/projects";

export function createRenameClientCommand() {
  return createCommand("client")
    .arguments("<name> <new-name>")
    .description(`Rename a ${style.client("client")}`)
    .action(async (clientName: string, newClientName: string) => {
      const queryResult = await queryProjectsByClient(clientName);
      if (queryResult.err) {
        logError(queryResult.val);
        return;
      }

      const projects = queryResult.val;
      if (!projects.length) {
        console.log(
          `Client ${style.client(
            clientName
          )} could not be renamed because it does not exist.`
        );
        return;
      }

      const updateResult = await updateProjects(
        projects.map((project) => project.modify({ client: newClientName }))
      );
      if (updateResult.err) {
        logError(updateResult.val);
        return;
      }

      console.log(
        `Renamed client ${style.client(clientName)} to ${style.client(
          newClientName
        )}.`
      );

      console.log(
        `${style.bold(projects.length.toString())} project${
          projects.length > 1 ? "s" : ""
        } modified.`
      );
    });
}
