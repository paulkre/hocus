import { Result } from "ts-results";
import { mutateSessions, getSessionsFile, SessionData } from "../data";
import { Session } from "../../../entities/session";
import { File } from "../../file";

export async function removeSession(
  session: Session
): Promise<Result<void, string>> {
  const file = getSessionsFile(session);
  return mutateSessions(
    (data) => {
      const index = data.findIndex(
        (other) => other.localID === session.localID
      );
      if (index < 0) return null;
      data.splice(index, 1);
      return data;
    },
    [file]
  );
}

export async function removeSessions(
  sessions: Session[]
): Promise<Result<void, string>> {
  const fileMap = new Map<File<SessionData[]>, Session[]>();
  sessions.forEach((session) => {
    const file = getSessionsFile(session);
    let sessionsInFile = fileMap.get(file);
    if (!sessionsInFile) sessionsInFile = [];
    sessionsInFile.push(session);
    fileMap.set(file, sessionsInFile);
  });

  const sessionsPerFile = Array.from(fileMap.values());
  return mutateSessions((data, i) => {
    sessionsPerFile[i].forEach((session) => {
      const index = data.findIndex(
        (other) => other.localID === session.localID
      );
      if (index < 0) return;
      data.splice(index, 1);
    });
    return data;
  }, Array.from(fileMap.keys()));
}
