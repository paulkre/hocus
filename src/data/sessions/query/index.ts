import { createSessionFromData } from "../data";
import { querySessionData, findSessionData, Filter } from "./data";
import { Session } from "../../../entities/session";

export async function querySessions(filter: Filter): Promise<Session[]> {
  return Promise.all(
    (await querySessionData(filter)).map((session) =>
      createSessionFromData(session)
    )
  );
}

export async function findSession(id: string): Promise<Session | undefined> {
  const data = await findSessionData(id);
  return data ? createSessionFromData(data) : undefined;
}
