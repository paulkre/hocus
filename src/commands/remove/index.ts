import { createCommand } from "../../command";
import * as style from "../../style";
import { createRemoveProjectCommand } from "./project";
import { createRemoveSessionCommand } from "./session";

export function createRemoveCommand() {
  return createCommand("remove")
    .description(
      `Remove a ${style.bold("session")} or a ${style.bold("project")}`
    )
    .addCommand(createRemoveProjectCommand())
    .addCommand(createRemoveSessionCommand());
}
