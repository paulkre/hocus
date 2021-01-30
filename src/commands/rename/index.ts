import { createCommand } from "../../command";
import * as style from "../../style";
import { createRenameProjectCommand } from "./project";
import { createRenameClientCommand } from "./client";
import { createRenameTagCommand } from "./tag";

export function createRenameCommand() {
  return createCommand("rename")
    .description(
      `Rename a ${style.bold("project")} or a ${style.bold("client")}`
    )
    .addCommand(createRenameProjectCommand())
    .addCommand(createRenameClientCommand())
    .addCommand(createRenameTagCommand());
}
