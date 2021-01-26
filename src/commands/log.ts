import { createCommand } from "../command";
import { loadSessions, Session } from "../data/session";
import {
  dateToDayString,
  dateToTimeString,
  durationToString,
  logError,
} from "../utils";
import { parseFilter } from "../parsing/filter";
import columnify from "columnify";
import * as style from "../style";
import { spawnSync } from "child_process";
import { EOL } from "os";

const dateToDayNum = (date: Date) => Math.floor(date.getTime() / 86_400_000);

type Options = {
  from?: string;
  to?: string;
  first?: string;
  last?: string;
  tags?: string[];
  raw?: boolean;
};

function outputViaPager(text: string) {
  spawnSync(`echo "${text}" | less -R`, [], { shell: true, stdio: "inherit" });
}

export function createLogCommand() {
  return createCommand("log")
    .option(
      "-f, --from <from>",
      `The ${style.date(
        "date"
      )} from which the output should start including data`
    )
    .option(
      "-t, --to <to>",
      `The ${style.date("date")} at which the output should stop including data`
    )
    .option(
      "--first <first>",
      `The number of ${style.session(
        "sessions"
      )} to include from the beginning of the selection`
    )
    .option(
      "--last <last>",
      `The number of ${style.session(
        "sessions"
      )} to include from the beginning of the selection`
    )
    .option(
      "-T, --tags <tags...>",
      `Only ${style.session("sessions")} with the specified ${style.tag(
        "tags"
      )} will be logged`
    )
    .option(
      "-r, --raw",
      "Output log directly to the terminal instead of passing it to the pager"
    )
    .description(
      `Display each recorded ${style.project(
        "session"
      )} in the given ${style.time("timespan")}`
    )
    .action(async (options: Options) => {
      const filterParseResult = parseFilter({
        ...options,
        tags: options.tags ? options.tags.join(" ") : "",
      });
      if (filterParseResult.err) {
        logError(filterParseResult.val);
        return;
      }

      const sessions = await loadSessions(filterParseResult.val);

      if (!sessions.length) {
        console.log("No data found.");
        return;
      }

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

      const dayEntries = Array.from(sessionsInDays.entries()).sort(
        ([a], [b]) => b.getTime() - a.getTime()
      );

      let output = "";
      dayEntries.forEach(([day, sessions], i) => {
        let dayTotalSeconds = 0;
        for (const { totalSeconds } of sessions)
          dayTotalSeconds += totalSeconds;
        const heading = `${style.date(dateToDayString(day))} (${style.time(
          durationToString(dayTotalSeconds)
        )})`;

        const table = columnify(
          sessions.map((session) => ({
            id: style.id(session.id),
            from: style.time(dateToTimeString(session.start)),
            sep0: "to",
            to: style.time(dateToTimeString(session.end)),
            duration: style.bold(durationToString(session.totalSeconds)),
            project: style.project(
              session.project.length > 20
                ? `${session.project.slice(0, 19)}…`
                : session.project
            ),
            tags: session.tags.length
              ? `[${session.tags.map((tag) => style.tag(tag)).join(", ")}]`
              : "",
          })),
          {
            showHeaders: false,
            columnSplitter: "    ",
            config: {
              id: {
                minWidth: 14,
                align: "right",
              },
              duration: { align: "right" },
              project: { align: "right" },
            },
          }
        );

        output += `${heading}
${table}
${i < dayEntries.length - 1 ? EOL : ""}`;
      });

      if (options.raw) console.log(output);
      else outputViaPager(output);
    });
}
