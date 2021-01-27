import { Result } from "ts-results";
import { mutateSessions } from "../data";

export async function renameProjectInSessions(
  projectName: string,
  newProjectName: string
): Promise<Result<void, string>> {
  return mutateSessions((data) => {
    let edited = false;
    const newData = data.map((session) => {
      if (session.project !== projectName) return session;
      edited = true;
      return {
        ...session,
        project: newProjectName,
      };
    });
    return edited ? newData : null;
  });
}
