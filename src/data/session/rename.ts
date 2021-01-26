import { Result, Ok, Err } from "ts-results";
import { getFilenames } from "./load/filenames";
import { createSessionFile, createSessionFromData, SessionData } from "./data";
import { Session } from "../../entities/session";

export async function renameProjectInSessions(
  projectName: string,
  newProjectName: string
): Promise<Result<Session[], string>> {
  const filenames = await getFilenames();
  if (!filenames.length) return Ok([]);
  const files = filenames.map((filename) => createSessionFile(filename));

  const result = Result.all(
    ...(await Promise.all(files.map((file) => file.load())))
  );
  if (result.err) return Err(result.val);

  const fileContents = result.val;

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

  return Ok(editedData.map((data) => createSessionFromData(data)));
}
