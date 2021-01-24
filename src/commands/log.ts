import { createCommand } from "../command";
import { loadSessions, Session } from "../data/session";
import {
  dateToDayString,
  dateToTimeString,
  durationToString,
  logError,
  parseDateInput,
  parseNumberInput,
  parseTagsInput,
} from "../utils";
import columnify from "columnify";
import * as style from "../style";

const dateToDayNum = (date: Date) => Math.floor(date.getTime() / 86_400_000);

type Options = {
  from?: string;
  to?: string;
  first?: string;
  last?: string;
  tags?: string[];
};

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
      `The number of ${style.project(
        "sessions"
      )} to include from the beginning of the selection`
    )
    .option(
      "--last <last>",
      `The number of ${style.project(
        "sessions"
      )} to include from the beginning of the selection`
    )
    .option(
      "-T, --tags <tags...>",
      `Only ${style.project("sessions")} with the specified ${style.tag(
        "tags"
      )} will be logged`
    )
    .description(
      `Display each recorded ${style.project(
        "session"
      )} in the given ${style.time("timespan")}`
    )
    .action(async (opt: Options) => {
      let to: Date;
      let from: Date;
      let first: number | undefined;
      let last: number | undefined;

      try {
        to = (opt.to && parseDateInput(opt.to, "to")) || new Date();
        from =
          (opt.from && parseDateInput(opt.from, "from")) ||
          new Date(to.getTime() - 604_800_000); // default is from 1 week ago
        if (opt.first) first = Math.floor(parseNumberInput(opt.first, "first"));
        if (opt.last) last = Math.floor(parseNumberInput(opt.last, "last"));
      } catch (message) {
        logError(message);
        return;
      }

      const tags = opt.tags ? parseTagsInput(opt.tags) : [];

      const sessions = await loadSessions({
        timespan: { from, to },
        first,
        last,
        tags,
      });

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

      dayEntries.forEach(([day, sessions], i) => {
        let dayTotalSeconds = 0;
        for (const { totalSeconds } of sessions)
          dayTotalSeconds += totalSeconds;
        console.log(
          `${style.date(dateToDayString(day))} (${style.time(
            durationToString(dayTotalSeconds)
          )})`
        );
        console.log(
          columnify(
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
          )
        );
        if (i < dayEntries.length - 1) console.log();
      });
    });
}
