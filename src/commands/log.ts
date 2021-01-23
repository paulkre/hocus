import { Command } from "commander";
import { loadSessions, Session } from "../data/session";
import chalk from "chalk";
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

const dateToDayNum = (date: Date) => Math.floor(date.getTime() / 86_400_000);

type Options = {
  from?: string;
  to?: string;
  first?: string;
  last?: string;
  tags?: string[];
};

export function createLogCommand() {
  return new Command("log")
    .option(
      "-f, --from <from>",
      "the date from which the output should start including data"
    )
    .option(
      "-t, --to <to>",
      "the date to which the output should stop including data"
    )
    .option(
      "--first <first>",
      "the number of sessions to include from the beginning of the selection"
    )
    .option(
      "--last <last>",
      "the number of sessions to include from the beginning of the selection"
    )
    .option(
      "-T, --tags <tags...>",
      "only sessions with the specified tags will be logged (you can use this option multiple times)"
    )
    .description("display each recorded session in the given timespan")
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
          `${dateToDayString(day)} (${chalk.green.bold(
            durationToString(dayTotalSeconds)
          )})`
        );
        console.log(
          columnify(
            sessions.map((session) => ({
              id: chalk.grey.bold(session.id),
              from: dateToTimeString(session.start),
              sep0: "to",
              to: dateToTimeString(session.end),
              duration: chalk.bold(durationToString(session.totalSeconds)),
              project: chalk.magenta.bold(
                session.project.length > 20
                  ? `${session.project.slice(0, 19)}…`
                  : session.project
              ),
              tags: session.tags.length
                ? `[${session.tags
                    .map((tag) => chalk.blue.bold(tag))
                    .join(", ")}]`
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
                // project: { align: "right" },
              },
            }
          )
        );
        if (i < dayEntries.length - 1) console.log();
      });
    });
}
