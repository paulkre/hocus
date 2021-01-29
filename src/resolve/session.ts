import { Result, Ok, Err } from "ts-results";
import { Session } from "../entities/session";
import { findSession } from "../data/sessions";
import { inquireSession } from "../input/inquiry/session";

export async function resolveSession(
  id?: string
): Promise<Result<Session | undefined, string>> {
  if (id) {
    const findResult = await findSession(id);
    if (findResult.err) return findResult;
    return Ok(findResult.val);
  }

  const inquireResult = await inquireSession();
  if (inquireResult.err) return Err(inquireResult.val);
  return Ok(inquireResult.val);
}
