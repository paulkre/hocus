import { Command } from "commander";
import { loadFrames, Frame } from "../data/frames";
import chalk from "chalk";
import {
  dateToDayString,
  dateToTimeString,
  durationToString,
  logError,
  parseDateInput,
  parseNumberInput,
} from "../utils";
import columnify from "columnify";

function handleNumberInput(value: string) {}

const dateToDayNum = (date: Date) => Math.floor(date.getTime() / 86_400_000);

type Options = {
  from?: string;
  to?: string;
  first?: string;
  last?: string;
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
    .description("Display each recorded session in the given timespan")
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

      const frames = await loadFrames({ timespan: { from, to }, first, last });

      if (!frames.length) {
        console.log("No data found.");
        return;
      }

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

      const dayEntries = Array.from(framesInDays.entries()).sort(
        ([a], [b]) => b.getTime() - a.getTime()
      );

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
