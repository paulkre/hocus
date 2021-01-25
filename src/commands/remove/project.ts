import { prompt } from "inquirer";
import { createCommand } from "../../command";
import { loadSessions } from "../../data/session";
import { removeSessions } from "../../data/session/remove";
import * as style from "../../style";

export function createRemoveProjectCommand() {
  return createCommand("project")
    .arguments("<name>")
    .description(`Remove a ${style.project("project")}`)
    .action(async (project: string) => {
      const sessions = await loadSessions({ project });

      if (!sessions.length) {
        console.log(`No sessions found for project ${style.project(project)}.`);
        return;
      }

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

      await removeSessions(sessions);
      console.log(
        `Removed ${style.bold(sessions.length)} session${
          sessions.length > 1 ? "s" : ""
        } of project ${style.project(project)}.`
      );
    });
}
