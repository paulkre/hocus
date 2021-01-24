import { Result, Ok, Err } from "ts-results";
import { Filter } from "../../data/session/load";
import { parseTimespan, TimespanInput } from "./timespan";
import { bold } from "../../style";
import { parseTags } from "..";

type FilterInput = TimespanInput & {
  from?: string;
  to?: string;
  tags?: string[];
};

const constructErrorMessage = (name: string) =>
  `The ${bold(name)} value for the requested timespan is invalid`;

export function parseFilter({
  from,
  to,
  tags,
  ...timespanInput
}: FilterInput): Result<Filter, string> {
  const timespanParseResult = parseTimespan(timespanInput);
  if (timespanParseResult.err) return Err(timespanParseResult.val);

  return Ok({
    timespan: timespanParseResult.val,
    tags: tags ? parseTags(tags) : [],
    from,
    to,
  });
}