import { createCommand } from "../../command";
import * as style from "../../style";

export function createRemoveProjectCommand() {
  return createCommand("project")
    .arguments("<name>")
    .description(`Remove a ${style.project("project")}`)
    .action(async (projectName: string) => {
      console.log("Removing project...");
    });
}
