import { prompt } from "inquirer";
import { SessionDataInput } from "../../parsing/session-data";
import { inquireProjectName } from "./project-name";

export async function inquireSessionData(
  input: Partial<SessionDataInput>
): Promise<SessionDataInput> {
  if (!input.projectName) input.projectName = await inquireProjectName();

  if (!input.start)
    input.start = (
      await prompt({
        name: "start",
        message: "Start Date",
      })
    ).start;

  if (!input.end)
    input.end = (
      await prompt({
        name: "end",
        message: "End Date",
      })
    ).end;

  if (!input.tags)
    input.tags = (
      await prompt({
        name: "tags",
        message: "Tags",
      })
    ).tags;

  console.log();

  return input as SessionDataInput;
}
