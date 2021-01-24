import { join as pathJoin } from "path";
import { SESSION_START_YEAR, SessionData, Session } from "..";
import { restoreSession } from "../creation";
import { config } from "../../../config";
import { createFile } from "../../file";

function dateIDToFilename(id: string) {
  const monthNum = parseInt(id, 36);
  const months = (monthNum % 12) + 1;
  return `${SESSION_START_YEAR + Math.floor(monthNum / 12)}-${
    months < 10 ? "0" : ""
  }${months}.json`;
}

export async function loadSingleSession(id: string): Promise<Session | null> {
  if (!id.match(/^[A-Za-z0-9]{4}-[A-Za-z0-9]{3}$/)) return null;
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
