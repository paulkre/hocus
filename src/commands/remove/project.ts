import { prompt } from "inquirer";
import { createCommand } from "../../command";
import {
  deleteProject,
  findProject,
  getSessionsForProject,
} from "../../data/projects";
import * as style from "../../style";
import { logError } from "../../utils";

export function createRemoveProjectCommand() {
  return createCommand("project")
    .arguments("<name>")
    .description(`Remove a ${style.project("project")}`)
    .action(async (projectName: string) => {
      const findResult = await findProject(projectName);
      if (findResult.err) {
        logError(findResult.val);
        return;
      }
      const project = findResult.val;

      if (!project) {
        console.log(`Project ${style.project(projectName)} does not exist.`);
        return;
      }

      const queryResult = await getSessionsForProject(project);
      if (queryResult.err) {
        logError(queryResult.val);
        return;
      }
      const sessions = queryResult.val;

      const { confirmed } = await prompt<{ confirmed: boolean }>([
        {
          name: "confirmed",
          type: "confirm",
          message: `Permanently remove ${sessions.length} session${
            sessions.length > 1 ? "s" : ""
          }?`,
          default: false,
        },
      ]);
      if (!confirmed) return;
      console.log();

      await deleteProject(project);

      console.log(
        `Removed ${style.bold(sessions.length)} session${
          sessions.length > 1 ? "s" : ""
        } of project ${style.project(projectName)}.`
      );
    });
}
