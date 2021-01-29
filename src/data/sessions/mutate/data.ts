import { Result, Ok } from "ts-results";
import { Session } from "../../../entities/session";
import { getSessionsFile, SessionData } from "../data";
import { File } from "../../file";

export async function mutateSessions(
  sessions: Session[],
  mutateFn: (data: SessionData[], selection: Session[]) => SessionData[] | null
): Promise<Result<void, string>> {
  const fileCollection = new Map<File<SessionData[]>, Session[]>();
  sessions.forEach((session) => {
    const file = getSessionsFile(session);
    let sessionsInFile = fileCollection.get(file);
    if (!sessionsInFile) sessionsInFile = [];
    sessionsInFile.push(session);
    fileCollection.set(file, sessionsInFile);
  });

  const files = Array.from(fileCollection.keys());

  const fileContent = (
    await Promise.all(files.map((file) => file.load()))
  ).map((result) => result.unwrapOr<SessionData[]>([]));

  const sessionsPerFile = Array.from(fileCollection.values());
  const editedFileContent = fileContent.map((data, i) =>
    mutateFn(data, sessionsPerFile[i])?.sort((a, b) => a.start - b.start)
  );

  await Promise.all(
    editedFileContent.map((data, i) => data && files[i].store(data, true))
  );

  return Ok(undefined);
}
