import { Command } from "commander";

export function createCommand(name?: string) {
  return new Command(name).helpOption("-h, --help", "Display help for command");
}
