import { Err, Ok, Result } from "ts-results";
import { Session } from "../entities/session";
import { loadSingleSession } from "../data/session";
import { bold } from "../style";

export async function parseSessionID(
  id: string
): Promise<Result<Session, string>> {
  const session = await loadSingleSession(id);
  return session
    ? new Ok(session)
    : new Err(`Session with ID ${bold(id)} does not exist.`);
}
