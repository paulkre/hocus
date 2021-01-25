import { prompt, DistinctQuestion } from "inquirer";
import { SessionDataInput } from "../parsing/session-data";

export async function inquireSessionData(
  defaults: Partial<SessionDataInput>,
  existing?: string[]
): Promise<SessionDataInput> {
  const questions: NonNullable<DistinctQuestion>[] = [
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
  ];

  const input = await prompt<SessionDataInput>(
    existing
      ? questions.filter((question) => !existing.includes(question.name!))
      : questions
  );
  console.log();
  return input;
}
