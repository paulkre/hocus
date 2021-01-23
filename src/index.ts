import { createCommand } from "./command";

import { createStartCommand } from "./commands/start";
import { createStatusCommand } from "./commands/status";
import { createStopCommand } from "./commands/stop";
import { createLogCommand } from "./commands/log";
import { createEditCommand } from "./commands/edit";

import pkg from "../package.json";

export function run(argv: string[]) {
  const program = createCommand()
    .version(`v${pkg.version}`, "-v, --version", "Output the version number")
    .addCommand(createStartCommand())
    .addCommand(createStatusCommand())
    .addCommand(createStopCommand())
    .addCommand(createLogCommand())
    .addCommand(createEditCommand());

  program.addHelpCommand("help [command]", "Display help for command");

  program.parse(argv);
}
