import { Result, Ok, Err } from "ts-results";
import {
  getSessionsFile,
  createSessionFromData,
  dateToSessionFilename,
} from "../data";
import { dateIDToDate, Session } from "../../../entities/session";

function isValidID(value: string) {
  return value.match(/^[a-z0-9]{8}$/);
}

export async function findSingleSession(
  id: string
): Promise<Result<Session, string>> {
  if (!isValidID(id)) return Err("The provided session ID is invalid.");
  const dateID = id.slice(0, 3);
  const localID = id.slice(3, 8);
  const result = await getSessionsFile(
    dateToSessionFilename(dateIDToDate(dateID))
  ).load();
  if (result.err) return Err(result.val);
  const data = result.val.find((data) => data.localID === localID);
  if (!data) return Err("The session does not exist.");
  return Ok(await createSessionFromData(data));
}
