import { Result, Ok, Err } from "ts-results";
import { Filter } from "../../data/sessions/query/data";
import { parseTimespan, TimespanInput } from "./timespan";
import { parseName, parseTags } from "..";

type FilterInput = TimespanInput & {
  from?: string;
  to?: string;
  tags?: string | string[];
  client?: string;
};

export function parseFilter({
  tags,
  client,
  ...timespanInput
}: FilterInput): Result<Filter, string> {
  const timespanParseResult = parseTimespan(timespanInput);
  if (timespanParseResult.err) return Err(timespanParseResult.val);

  return Ok({
    tags: tags ? parseTags(tags) : undefined,
    client: client && parseName(client),
    timespan: timespanParseResult.val,
  });
}
