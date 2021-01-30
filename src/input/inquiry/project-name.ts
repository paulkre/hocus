import { prompt } from "inquirer";
import { querySessions } from "../../data/sessions";
import { Session } from "../../entities/session";

export async function inquireProjectName(): Promise<string> {
  const [lastSession] = (await querySessions({ last: 1 })).unwrapOr<Session[]>(
    []
  );
  const { project } = await prompt<{ project: string }>([
    {
      name: "project",
      message: "Project",
      default: lastSession && lastSession.project.name,
    },
  ]);
  console.log();
  return project;
}
