import { join as pathJoin } from "path";
import { dateIDToFilename, SessionData, Session } from "..";
import { restoreSession } from "../creation";
import { config } from "../../../config";
import { createFile } from "../../file";

function isValidID(value: string) {
  return value.match(/^[A-Za-z0-9]{4}-[A-Za-z0-9]{3}$/);
}

export async function loadSingleSession(id: string): Promise<Session | null> {
  if (!isValidID(id)) return null;
  const [localID, dateID] = id.split("-");
  if (!dateID) return null;
  const contents = await createFile<SessionData[]>(
    pathJoin(config.dataDirectory, dateIDToFilename(dateID))
  ).load();
  if (!contents) return null;
  const data = contents.find((sessionData) => sessionData.localID === localID);
  if (!data) return null;
  return restoreSession(data);
}
