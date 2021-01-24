import { prompt } from "inquirer";
import { Options } from ".";

export async function inquireOptions(defaults: Options): Promise<Options> {
  const input = await prompt<Options>([
    {
      name: "project",
      message: "Project",
      default: defaults.project,
    },
    {
      name: "start",
      message: "Start Date",
      default: defaults.start,
    },
    {
      name: "end",
      message: "End Date",
      default: defaults.end,
    },
    {
      name: "tags",
      message: "Tags",
      default: defaults.tags,
    },
  ]);
  console.log();
  return input;
}
