import { Result, Ok, Err } from "ts-results";
import { Session } from "../../entities/session";
import { createSessionFileFromDate, SessionData } from "./data";
import { createFile } from "../file";

export async function removeSession({
  localID,
  start,
}: Session): Promise<Result<void, string>> {
  const file = createSessionFileFromDate(start);
  const result = await file.load();
  if (result.err) return Err(result.val);
  const data = result.val;

  const foundIndex = data.findIndex((other) => other.localID === localID);
  if (foundIndex < 0) return Err("Session could not be found in data.");

  data.splice(foundIndex, 1);

  await file.store(data, true);

  return Ok(undefined);
}

type CacheValue = [ReturnType<typeof createFile>, SessionData[] | null];
export async function removeSessions(sessions: Session[]): Promise<void> {
  const dataCache = new Map<string, CacheValue>();

  for (const { dateID, start } of sessions) {
    if (!dataCache.has(dateID)) {
      const file = createSessionFileFromDate(start);
      const result = await file.load();
      dataCache.set(dateID, [file, result.ok ? result.val : null]);
    }
  }

  for (const { dateID, localID } of sessions) {
    const [, data] = dataCache.get(dateID)!;
    if (!data) continue;

    const foundIndex = data.findIndex((session) => session.localID === localID);
    if (foundIndex < 0) continue;

    data.splice(foundIndex, 1);
  }

  await Promise.all(
    Array.from(dataCache.values()).map(
      ([file, data]) => data && file.store(data)
    )
  );
}
