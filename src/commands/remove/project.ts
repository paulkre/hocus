import { prompt } from "inquirer";
import { createCommand } from "../../command";
import {
  deleteProject,
  findProject,
  getSessionsForProject,
} from "../../data/projects";
import * as style from "../../style";

export function createRemoveProjectCommand() {
  return createCommand("project")
    .arguments("<name>")
    .description(`Remove a ${style.project("project")}`)
    .action(async (projectName: string) => {
      const project = await findProject(projectName);

      if (!project) {
        console.log(`Project ${style.project(projectName)} does not exist.`);
        return;
      }

      const sessions = await getSessionsForProject(project);

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
