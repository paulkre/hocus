import { Result, Ok } from "ts-results";
import { dataToSession, dateToSessionFilename, getSessionsFile } from "../data";
import { querySessionData, findSessionData, Filter } from "./data";
import { Session } from "../../../entities/session";

export async function querySessions(
  filter: Filter
): Promise<Result<Session[], string>> {
  const queryResult = await querySessionData(filter);
  return queryResult.ok
    ? Result.all(
        ...(await Promise.all(
          queryResult.val.map((session) => dataToSession(session))
        ))
      )
    : queryResult;
}

export async function findSession(
  id: string
): Promise<Result<Session | undefined, string>> {
  const findResult = await findSessionData(id);
  if (findResult.err) return findResult;
  if (!findResult.val) return Ok(undefined);

  const createResult = await dataToSession(findResult.val);
  return createResult.ok ? Ok(createResult.val) : createResult;
}

export async function findSessionByDate(
  date: Date
): Promise<Result<Session | undefined, string>> {
  const file = getSessionsFile(dateToSessionFilename(date));
  const loadResult = await file.load();
  if (loadResult.err) return loadResult;
  const seconds = Math.floor(date.getTime() / 1000);
  const sessionData = loadResult.val.find(
    (sessionData) => sessionData.start < seconds && sessionData.end > seconds
  );
  return sessionData ? dataToSession(sessionData) : Ok(undefined);
}
