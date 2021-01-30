import { createCommand } from "../../command";
import { editSession, createEditSessionCommand } from "./session";
import { createEditProjectCommand } from "./project";
import * as style from "../../style";

export function createEditCommand() {
  return createCommand("edit")
    .description(
      `Modify the properties of a recorded ${style.bold(
        "session"
      )} or a ${style.bold("project")}`
    )
    .addCommand(createEditSessionCommand())
    .addCommand(createEditProjectCommand())
    .action(async () => {
      return editSession();
    });
}
