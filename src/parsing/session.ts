import { Err, Ok, Result } from "ts-results";
import { loadSingleSession, Session } from "../data/session";
import { bold } from "../style";

export async function parseSession(
  id: string
): Promise<Result<Session, string>> {
  const session = await loadSingleSession(id);
  return session
    ? new Ok(session)
    : new Err(`Session with ID ${bold(id)} could not be found.`);
}
