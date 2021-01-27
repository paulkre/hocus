import { prompt } from "inquirer";
import { querySessions } from "../../data/session";

export async function inquireProjectName(): Promise<string> {
  const [lastSession] = await querySessions({ last: 1 });
  return (
    await prompt<{ project: string }>([
      {
        name: "project",
        message: "Project",
        default: lastSession && lastSession.project.name,
      },
    ])
  ).project;
}
