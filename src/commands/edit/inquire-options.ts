import { prompt } from "inquirer";
import { Options } from ".";

export async function inquireOptions(defaults: Options): Promise<Options> {
  const input = await prompt<Options>([
    {
      name: "project",
      message: "What do you want to call the project",
      default: defaults.project,
    },
    {
      name: "start",
      message: "When should the session start?",
      default: defaults.start,
    },
    {
      name: "end",
      message: "When should the session end?",
      default: defaults.end,
    },
    {
      name: "tags",
      message: "Which tags should the session use?",
      default: defaults.tags,
    },
  ]);
  console.log();
  return input;
}
