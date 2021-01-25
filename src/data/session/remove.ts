import { join as pathJoin } from "path";
import { Result, Ok, Err } from "ts-results";
import { dateIDToFilename, Session, SessionData } from ".";
import { createFile } from "../file";
import { config } from "../../config";
import data from "*.json";

export async function removeSession({
  dateID,
  data: { localID },
}: Session): Promise<Result<void, string>> {
  const file = createFile<SessionData[]>(
    pathJoin(config.dataDirectory, dateIDToFilename(dateID))
  );
  const data = await file.load();

  if (!data) return Err("Session could not be loaded from disk.");

  const foundIndex = data.findIndex((session) => session.localID === localID);
  if (foundIndex < 0) return Err("Session could not be found in data.");

  data.splice(foundIndex, 1);

  return Ok(file.store(data, true));
}

type CacheValue = [ReturnType<typeof createFile>, SessionData[] | null];
export async function removeSessions(sessions: Session[]): Promise<void> {
  const dataCache = new Map<string, CacheValue>();

  for (const { dateID } of sessions) {
    if (!dataCache.has(dateID)) {
      const file = createFile<SessionData[]>(
        pathJoin(config.dataDirectory, dateIDToFilename(dateID))
      );
      dataCache.set(dateID, [file, await file.load()]);
    }
  }

  for (const {
    dateID,
    data: { localID },
  } of sessions) {
    const [, data] = dataCache.get(dateID)!;
    if (!data) return;

    const foundIndex = data.findIndex((session) => session.localID === localID);
    if (foundIndex < 0) return;

    data.splice(foundIndex, 1);
  }

  Array.from(dataCache.values()).forEach(([file, data]) => {
    if (data) file.store(data);
  });
}
