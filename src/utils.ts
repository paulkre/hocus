import { ago } from "time-ago";
import { format as formatDate } from "date-and-time";
import * as style from "./style";

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
  return style.time(ago(date));
}

export function dateToTimeString(date: Date) {
  return formatDate(date, "HH:mm");
}

export function dateToDateTimeString(date: Date) {
  return formatDate(date, "YYYY-MM-DD HH:mm");
}

export function dateToDayString(date: Date) {
  return formatDate(date, "dddd D MMMM YYYY");
}

export function logError(message: string) {
  console.log(`Error: ${style.error(message)}`);
}

export function humanizeTags(tags: string[]): string {
  return tags.length > 1
    ? `${tags
        .slice(0, -1)
        .map((tag) => style.tag(tag))
        .join(", ")} and ${style.tag(tags[tags.length - 1])}`
    : style.tag(tags[0]);
}

export function dateToInputDefault(date: Date) {
  return formatDate(date, "YYYY-MM-DD HH:mm:ss");
}
