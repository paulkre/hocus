import { Ok, Result } from "ts-results";
import { FilterOptions } from "../input/fliter";
import { Session } from "../entities/session";
import { parseFilter } from "../parsing/filter";
import { querySessions } from "../data/sessions";

export async function resolveFilter(
  options: FilterOptions
): Promise<Result<Session[] | undefined, string>> {
  const filterParseResult = await parseFilter(options);
  if (filterParseResult.err) return filterParseResult;

  const queryResult = await querySessions(filterParseResult.val);
  if (queryResult.err) return queryResult;

  const sessions = queryResult.val;

  if (!sessions.length) {
    console.log("No data found.");
    return Ok(undefined);
  }

  return Ok(sessions);
}
