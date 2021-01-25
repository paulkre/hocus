import { createCommand } from "../command";
import * as style from "../style";
import { renameProjectInSessions } from "../data/session/rename";

export function createRemoveCommand() {
  return (
    createCommand("remove")
      .arguments("<type> <new-name>")
      .description(`Rename a ${style.project("project")}`, {
        type: "",
        "new-name": "",
      })
      // .configureOutput({
      //   writeErr: (str) => console.log(`[ERR] ${str}`),
      // })
      .action(async (projectName: string, newProjectName: string) => {})
  );
}
