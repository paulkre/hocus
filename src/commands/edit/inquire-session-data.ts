import { prompt } from "inquirer";
import { SessionDataInput } from "../../parsing/session-data";

export async function inquireSessionData(
  defaults: SessionDataInput
): Promise<SessionDataInput> {
  const input = await prompt<SessionDataInput>([
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
