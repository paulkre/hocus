import { createCommand } from "../../command";
import * as style from "../../style";
import { createRenameProjectCommand } from "./project";

export function createRenameCommand() {
  return createCommand("rename")
    .description(
      `Rename a ${style.project("project")} or a ${style.client("client")}`
    )
    .addCommand(createRenameProjectCommand());
}
