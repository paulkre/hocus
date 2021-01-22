import { ago } from "time-ago";
import { format as formatDate } from "date-and-time";
import { parseDate as chronoParse } from "chrono-node";
import chalk from "chalk";

const styleDateString = (value: string) => chalk.cyan.bold(value);

export function durationToString(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  seconds -= 3600 * hours;

  const minutes = Math.floor(seconds / 60);
  seconds -= 60 * minutes;

  return `${hours ? `${hours}h ` : ""}${
    minutes ? `${minutes}m ` : ""
  }${seconds}s`;
}

export function getRelativeTime(date: Date) {
  return chalk.green.bold(ago(date));
}

export function dateToTimeString(date: Date) {
  return chalk.green.bold(formatDate(date, "HH:mm"));
}

export function dateToDateTimeString(date: Date) {
  return styleDateString(formatDate(date, "YYYY-MM-DD HH:mm"));
}

export function dateToDayString(date: Date) {
  return styleDateString(formatDate(date, "dddd D MMMM YYYY"));
}

export function logError(message: string) {
  console.log(chalk.red(message));
}

export function parseDate(value: string): Date | null {
  return chronoParse(value);
}