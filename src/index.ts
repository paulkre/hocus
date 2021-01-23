import { Command } from "commander";

import { createStartCommand } from "./commands/start";
import { createStatusCommand } from "./commands/status";
import { createStopCommand } from "./commands/stop";
import { createLogCommand } from "./commands/log";
import { createEditCommand } from "./commands/edit";

import pkg from "../package.json";

export function run(argv: string[]) {
  const program = new Command()
    .version(`v${pkg.version}`, "-v, --version")
    .addCommand(createStartCommand())
    .addCommand(createStatusCommand())
    .addCommand(createStopCommand())
    .addCommand(createLogCommand())
    .addCommand(createEditCommand());

  // console.log(program.commands.map((cmd) => cmd.));

  program.parse(argv);
}
