import { Command } from "commander";

import { createStartCommand } from "./commands/start";
import { createStatusCommand } from "./commands/status";
import { createStopCommand } from "./commands/stop";
import { createLogCommand } from "./commands/log";

import pkg from "../package.json";

export function run(argv: string[]) {
  new Command()
    .version(`v${pkg.version}`)
    .addCommand(createStartCommand())
    .addCommand(createStatusCommand())
    .addCommand(createStopCommand())
    .addCommand(createLogCommand())
    .parse(argv);
}
