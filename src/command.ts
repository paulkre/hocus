import { Command } from "commander";
import { logError } from "./utils";
import { bold } from "./style";
import { EOL } from "os";

export function createCommand(name?: string) {
  return new Command(name)
    .helpOption("-h, --help", "Display help for command")
    .configureOutput({
      writeErr: (str) => {
        if ((str.match(new RegExp(EOL, "g")) || []).length > 1) {
          console.log(str);
          return;
        }

        let [, message] = str.split(": ");
        if (message[message.length - 1] === EOL) message = message.slice(0, -1);
        message.match(/'[^']+'/g)?.forEach((match) => {
          message = message.replace(match, bold(match.slice(1, -1)));
        });
        logError(
          `${message[0].toUpperCase()}${message.slice(1)}${
            message[message.length - 1] !== "." ? "." : ""
          }`
        );
      },
    });
}
