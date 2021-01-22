import { Command } from "commander";

import { createStartCommand } from "./commands/start";
import { createStatusCommand } from "./commands/status";
import { createStopCommand } from "./commands/stop";
import { createLogCommand } from "./commands/log";

export function run(argv: string[]) {
  new Command()
    .version("v0.1.0")
    .addCommand(createStartCommand())
    .addCommand(createStatusCommand())
    .addCommand(createStopCommand())
    .addCommand(createLogCommand())
    .parse(argv);
}
