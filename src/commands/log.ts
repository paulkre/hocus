import { createCommand } from "../command";
import { Session } from "../entities/session";
import { querySessions } from "../data/sessions";
import {
  dateToDayString,
  dateToTimeString,
  durationToString,
  logError,
  limitString,
} from "../utils";
import { parseFilter } from "../parsing/filter";
import columnify from "columnify";
import { EOL } from "os";
import { outputText } from "../output/text";
import * as style from "../style";
import { wrapCommandWithFilterOptions, FilterOptions } from "../input/fliter";
import { resolveFilter } from "../resolve/filter";

const dateToDayNum = (date: Date) => Math.floor(date.getTime() / 86_400_000);

export function createLogCommand() {
  return wrapCommandWithFilterOptions(createCommand("log"))
    .description(
      `Display each recorded ${style.bold("session")} in the given timespan`
    )
    .action(async (options: FilterOptions) => {
      const resolveResult = await resolveFilter(options);
      if (resolveResult.err) {
        logError(resolveResult.val);
        return;
      }
      const sessions = resolveResult.val;

      if (!sessions) return;

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
        for (const { startSeconds, endSeconds } of sessions)
          dayTotalSeconds += endSeconds - startSeconds;
        const heading = `${style.date(dateToDayString(day))} (${style.time(
          durationToString(dayTotalSeconds)
        )})`;

        const table = columnify(
          sessions.map(
            ({ id, project, start, end, startSeconds, endSeconds, tags }) => ({
              id: style.light(id),
              from: style.time(dateToTimeString(start)),
              sep0: "to",
              to: style.time(dateToTimeString(end)),
              duration: style.bold(durationToString(endSeconds - startSeconds)),
              project: style.project(limitString(project.name, 20)),
              client: project.client
                ? style.client(limitString(project.client, 10))
                : "",
              tags: tags
                ? `[${tags
                    .map((tag) => style.tag(limitString(tag, 10)))
                    .join(", ")}]`
                : "",
            })
          ),
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

      outputText(output);
    });
}
