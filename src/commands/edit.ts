import { createCommand } from "../command";
import * as style from "../style";

export function createEditCommand() {
  return createCommand("edit")
    .arguments("[id]")
    .description(
      `Modify the attributes of a ${style.project(
        "session"
      )} with the given ${style.bold("ID")}`
    )
    .action(async () => {});
}
