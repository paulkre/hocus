import { createCommand } from "../../command";
import * as style from "../../style";
import { createRemoveProjectCommand } from "./project";
import { createRemoveSessionCommand } from "./session";

export function createRemoveCommand() {
  return createCommand("remove")
    .description(
      `Remove a ${style.session("session")} or a ${style.project("project")}`
    )
    .addCommand(createRemoveProjectCommand())
    .addCommand(createRemoveSessionCommand());
}
