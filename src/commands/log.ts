import { Command } from "commander";
import { loadFrames, Frame } from "../data/frames";
import chalk from "chalk";
import {
  dateToDayString,
  dateToTimeString,
  durationToString,
  logError,
  parseDate,
} from "../utils";
import columnify from "columnify";

function handleDateInput(value: string, name: string): Date {
  const date = parseDate(value);
  if (!date) throw name;
  return date;
}

const dateToDayNum = (date: Date) => Math.floor(date.getTime() / 86_400_000);

export function createLogCommand() {
  return new Command("log")
    .option(
      "-f, --from <from>",
      "The date from which the output should start including data"
    )
    .option(
      "-t, --to <to>",
      "The date to which the output should stop including data"
    )
    .description("Display each recorded session in the given timespan")
    .action(async ({ from, to }: { from?: string; to?: string }) => {
      let toDate: Date;
      let fromDate: Date;

      try {
        toDate = (to && handleDateInput(to, "to")) || new Date();
        fromDate =
          (from && handleDateInput(from, "from")) ||
          new Date(toDate.getTime() - 604_800_000); // default is from 1 week ago
      } catch (name) {
        logError(
          `Date / time value for option ${chalk.bold(name)} is invalid.`
        );
        return;
      }

      const frames = await loadFrames({ from: fromDate, to: toDate });
      const framesInDays = new Map<Date, Frame[]>();

      let currentDayNum = 0;
      let currentDayFrames: Frame[] = [];
      frames.forEach((frame) => {
        const dayNum = dateToDayNum(frame.start);
        if (dayNum !== currentDayNum) {
          currentDayFrames = [];
          framesInDays.set(frame.start, currentDayFrames);
          currentDayNum = dayNum;
        }
        currentDayFrames.push(frame);
      });

      const dayEntries = Array.from(framesInDays.entries());

      dayEntries.forEach(([day, frames], i) => {
        let dayTotalSeconds = 0;
        for (const { totalSeconds } of frames) dayTotalSeconds += totalSeconds;
        console.log(
          `${dateToDayString(day)} (${chalk.green.bold(
            durationToString(dayTotalSeconds)
          )})`
        );
        console.log(
          columnify(
            frames.map((frame) => ({
              id: chalk.grey.bold(frame.id),
              from: dateToTimeString(frame.start),
              sep0: "to",
              to: dateToTimeString(frame.end),
              duration: chalk.bold(durationToString(frame.totalSeconds)),
              project: chalk.magenta.bold(frame.project),
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
