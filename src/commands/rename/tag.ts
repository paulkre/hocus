import { Result, Ok, Err } from "ts-results";
import { createCommand } from "../../command";
import * as style from "../../style";
import { querySessions, updateSessionsUnsafe } from "../../data/sessions";
import { logError } from "../../utils";
import { parseName, parseTags } from "../../parsing";

async function renameTag(
  tagName: string,
  newTagName: string
): Promise<Result<void, string>> {
  const queryResult = await querySessions({ tags: [tagName] });
  if (queryResult.err) return queryResult;

  const sessions = queryResult.val;
  if (!sessions.length) {
    console.log(`Tag ${style.bold(tagName)} is not used on any sessions.`);
    return Ok(undefined);
  }

  const parsedNewName = parseName(newTagName);
  if (!parsedNewName) return Err("New tag name is invalid.");

  if (tagName === parsedNewName) {
    console.log(`Tag ${style.tag(tagName)} already has this name.`);
    return Ok(undefined);
  }

  const updateResult = await updateSessionsUnsafe(
    sessions.map((session) => {
      const tags = [...session.tags!, parsedNewName];
      tags.splice(tags.indexOf(tagName), 1);
      return session.mutate({ tags: parseTags(tags) });
    })
  );
  if (updateResult.err) return updateResult;

  console.log(
    `Renamed tag ${style.light(tagName)} to ${style.project(parsedNewName)}.`
  );

  console.log(
    `${style.bold(sessions.length.toString())} session${
      sessions.length > 1 ? "s" : ""
    } modified.`
  );

  return Ok(undefined);
}

export function createRenameTagCommand() {
  return createCommand("tag")
    .arguments("<name> <new-name>")
    .description(`Rename a ${style.tag("tag")}`)
    .action(async (name: string, newName: string) => {
      const renameResult = await renameTag(name, newName);
      if (renameResult.err) logError(renameResult.val);
    });
}
