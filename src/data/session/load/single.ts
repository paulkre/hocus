import { createSessionFileFromDate, createSessionFromData } from "../data";
import { dateIDToDate, Session } from "../../../entities/session";

function isValidID(value: string) {
  return value.match(/^[a-z0-9]{8}$/);
}

export async function loadSingleSession(id: string): Promise<Session | null> {
  if (!isValidID(id)) return null;
  const dateID = id.slice(0, 3);
  const localID = id.slice(3, 8);
  if (!dateID) return null;
  const content = await createSessionFileFromDate(dateIDToDate(dateID)).load();
  if (!content) return null;
  const data = content.find((data) => data.localID === localID);
  if (!data) return null;
  return createSessionFromData(data);
}
