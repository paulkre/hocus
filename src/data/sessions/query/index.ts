import { Result, Ok } from "ts-results";
import { createSessionFromData } from "../data";
import { querySessionData, findSessionData, Filter } from "./data";
import { Session } from "../../../entities/session";

export async function querySessions(
  filter: Filter
): Promise<Result<Session[], string>> {
  const queryResult = await querySessionData(filter);
  return queryResult.ok
    ? Result.all(
        ...(await Promise.all(
          queryResult.val.map((session) => createSessionFromData(session))
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

  const createResult = await createSessionFromData(findResult.val);
  return createResult.ok ? Ok(createResult.val) : createResult;
}
