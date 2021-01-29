import { Result, Ok, Err } from "ts-results";
import { Session } from "../entities/session";
import { findSession } from "../data/sessions";
import { inquireSession } from "../input/inquiry/session";

export async function resolveSession(
  id?: string
): Promise<Result<Session, string>> {
  let session: Session | undefined;
  if (id) session = await findSession(id);
  else {
    const inquireResult = await inquireSession();
    if (inquireResult.err) return Err(inquireResult.val);
    session = inquireResult.val;
  }

  return session ? Ok(session) : Err(`Session could not be found.`);
}
