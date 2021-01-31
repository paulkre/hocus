import { createCommand } from "./command";

import { createStartCommand } from "./commands/start";
import { createStatusCommand } from "./commands/status";
import { createStopCommand } from "./commands/stop";
import { createLogCommand } from "./commands/log";
import { createEditCommand } from "./commands/edit";
import { createAddCommand } from "./commands/add";
import { createRenameCommand } from "./commands/rename";
import { createRemoveCommand } from "./commands/remove";
import { createCancelCommand } from "./commands/cancel";
import { createRestartCommand } from "./commands/restart";
import { createProjectsCommand } from "./commands/projects";
import { createReportCommand } from "./commands/report";

import pkg from "../package.json";

export function run(argv: string[]) {
  const program = createCommand()
    .version(`v${pkg.version}`, "-v, --version", "Output the version number")
    .addCommand(createStartCommand())
    .addCommand(createStatusCommand())
    .addCommand(createStopCommand())
    .addCommand(createLogCommand())
    .addCommand(createEditCommand())
    .addCommand(createAddCommand())
    .addCommand(createRenameCommand())
    .addCommand(createRemoveCommand())
    .addCommand(createCancelCommand())
    .addCommand(createRestartCommand())
    .addCommand(createProjectsCommand())
    .addCommand(createReportCommand())
    .action(async () => {
      console.log(program.helpInformation());
    });

  program.addHelpCommand("help [command]", "Display help for command");

  program.parse(argv);
}
