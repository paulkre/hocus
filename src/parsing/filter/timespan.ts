import { Result, Ok, Err } from "ts-results";
import { parseDate } from "..";
import { Timespan } from "../../data/sessions/query/timespan";
import { bold } from "../../style";

export type TimespanInput = {
  from?: string;
  to?: string;
};

const constructErrorMessage = (name: string) =>
  `The ${bold(name)} value for the requested timespan is invalid`;

export function parseTimespan(input: TimespanInput): Result<Timespan, string> {
  const to = parseDate(input.to || new Date().toString());
  if (!to) return Err(constructErrorMessage("to"));

  const from = parseDate(
    input.from || new Date(to.getTime() - 604_800_000).toString()
  ); // default is from 1 week ago
  if (!from) return Err(constructErrorMessage("from"));

  return Ok({ from, to });
}
