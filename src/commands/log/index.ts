import { Ok, Result } from "ts-results";
import { createCommand } from "../../command";
import {
  wrapCommandWithFilterOptions,
  FilterOptions,
} from "../../input/fliter";
import { durationToString, dateToDayString } from "../../utils";
import { resolveFilter } from "../../resolve/filter";
import { Session } from "../../entities/session";
import { EOL } from "os";
import { outputText } from "../../output/text";
import { sessionsToTable } from "./table";
import { sessionsToList } from "./list";
import { logError } from "../../utils";
import * as style from "../../style";

type Options = FilterOptions & {
  table?: boolean;
};

const dateToDayNum = (date: Date) => Math.floor(date.getTime() / 86_400_000);

async function log(options: Options): Promise<Result<void, string>> {
  const resolveFilterResult = await resolveFilter(options);
  if (resolveFilterResult.err) return resolveFilterResult;

  const sessions = resolveFilterResult.val;
  if (!sessions) return Ok(undefined);

  const sessionsInDays = new Map<Date, Session[]>();

  let currentDayNum = 0;
  let currentDaySessions: Session[] = [];
  sessions.forEach((session) => {
    const dayNum = dateToDayNum(session.start);
    if (dayNum !== currentDayNum) {
      currentDaySessions = [];
      sessionsInDays.set(session.start, currentDaySessions);
      currentDayNum = dayNum;
    }
    currentDaySessions.push(session);
  });

  const stringifyFn: (sessions: Session[]) => void = options.table
    ? sessionsToTable
    : sessionsToList;

  const dayEntries = Array.from(sessionsInDays.entries()).sort(
    ([a], [b]) => b.getTime() - a.getTime()
  );

  let output = "";

  dayEntries.forEach(([day, sessions], i) => {
    let dayTotalSeconds = 0;
    for (const { startSeconds, endSeconds } of sessions)
      dayTotalSeconds += endSeconds - startSeconds;
    const heading = `${style.date(dateToDayString(day))} (${style.time(
      durationToString(dayTotalSeconds)
    )})`;

    output += `${heading}

${stringifyFn(sessions)}

${i < dayEntries.length - 1 ? EOL : ""}`;
  });

  outputText(output);

  return Ok(undefined);
}

export function createLogCommand() {
  return wrapCommandWithFilterOptions(createCommand("log"))
    .option("--table", `Display ${style.bold("sessions")} in tables`)
    .description(
      `Display each recorded ${style.bold("session")} in the given timespan`
    )
    .action(async (options: Options) => {
      const result = await log(options);
      if (result.err) logError(result.val);
    });
}
