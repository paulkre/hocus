import { createCommand } from "../../command";
import * as style from "../../style";

export function createRemoveSessionCommand() {
  return createCommand("session")
    .arguments("<id>")
    .description(`Remove a ${style.session("session")}`)
    .action(async (id: string) => {
      console.log("Removing session...");
    });
}
