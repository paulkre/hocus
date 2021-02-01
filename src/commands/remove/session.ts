import { Ok, Result } from "ts-results";
import { createCommand } from "../../command";
import { deleteSession } from "../../data/sessions";
import * as style from "../../style";
import { logError } from "../../utils";
import { resolveSession } from "../../resolve/session";

export async function removeSession(
  id?: string
): Promise<Result<void, string>> {
  const resolveResult = await resolveSession(id);
  if (resolveResult.err) return resolveResult;

  const session = resolveResult.val;
  if (!session) {
    console.log(`Session could not be found.`);
    return Ok(undefined);
  }

  const deleteResult = await deleteSession(session);
  if (deleteResult.err) return deleteResult;

  console.log(`Session ${style.session(session.id)} was removed successfully.`);

  return Ok(undefined);
}

export function createRemoveSessionCommand() {
  return createCommand("session")
    .arguments("[id]")
    .description(`Remove a ${style.bold("session")}`)
    .action(async (id: string | undefined) => {
      const result = await removeSession(id);
      if (result.err) logError(result.val);
    });
}
