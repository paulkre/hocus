import { join as pathJoin } from "path";
import { getFilenames } from "./load/filenames";
import { createFile } from "./../file";
import { config } from "./../../config";
import { Session, SessionData } from ".";
import { createSession } from "./creation";

export async function renameProjectInSessions(
  projectName: string,
  newProjectName: string
): Promise<Session[]> {
  const filenames = await getFilenames();
  const files = filenames.map((filename) =>
    createFile<SessionData[]>(pathJoin(config.dataDirectory, filename))
  );

  const fileContents = await Promise.all(files.map((file) => file.load()));

  const editedData: SessionData[] = [];
  const editedContents = fileContents.map((data) => {
    if (!data) return data;

    let edited = false;
    const newData = data.map((session) => {
      if (session.project !== projectName) return session;
      edited = true;
      const newSession: SessionData = {
        ...session,
        project: newProjectName,
      };
      editedData.push(newSession);
      return newSession;
    });

    return edited ? newData : null;
  });

  await Promise.all(
    editedContents.map((data, i) => {
      if (!data) return null;
      return files[i].store(data, true);
    })
  );

  return editedData.map((data) => createSession(data));
}
