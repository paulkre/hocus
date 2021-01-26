import { prompt } from "inquirer";
import { loadSessions } from "../../data/session";

export async function inquireProjectName(): Promise<string> {
  const [lastSession] = await loadSessions({ last: 1 });
  return (
    await prompt<{ project: string }>([
      {
        name: "project",
        message: "Project",
        default: lastSession && lastSession.project,
      },
    ])
  ).project;
}
