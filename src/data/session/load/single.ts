import { join as pathJoin } from "path";
import { SessionData, Session } from "..";
import { dateIDToFilename } from "../date";
import { restoreSession } from "../creation";
import { config } from "../../../config";
import { createFile } from "../../file";

function isValidID(value: string) {
  return value.match(/^[a-z0-9]{7}$/);
}

export async function loadSingleSession(id: string): Promise<Session | null> {
  if (!isValidID(id)) return null;
  const dateID = id.slice(0, 3);
  const localID = id.slice(3, 7);
  if (!dateID) return null;
  const contents = (await createFile(
    pathJoin(config.dataDirectory, dateIDToFilename(dateID))
  ).load()) as SessionData[];
  if (!contents) return null;
  const data = contents.find((sessionData) => sessionData.localID === localID);
  if (!data) return null;
  return restoreSession(data);
}
