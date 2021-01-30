import { createCommand } from "../../command";
import * as style from "../../style";
import { logError } from "../../utils";
import { createRemoveProjectCommand } from "./project";
import { createRemoveSessionCommand, removeSession } from "./session";

export function createRemoveCommand() {
  return createCommand("remove")
    .description(
      `Remove a ${style.bold("session")} or a ${style.bold("project")}`
    )
    .addCommand(createRemoveProjectCommand())
    .addCommand(createRemoveSessionCommand())
    .action(async () => {
      const result = await removeSession();
      if (result.err) logError(result.val);
    });
}
