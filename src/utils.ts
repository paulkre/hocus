import { ago } from "time-ago";
import { format as formatDate } from "date-and-time";
import { parseDate as chronoParse } from "chrono-node";
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
  return style.time(formatDate(date, "HH:mm"));
}

export function dateToDateTimeString(date: Date) {
  return style.date(formatDate(date, "YYYY-MM-DD HH:mm"));
}

export function dateToDayString(date: Date) {
  return style.date(formatDate(date, "dddd D MMMM YYYY"));
}

export function logError(message: string) {
  console.log(style.error(message));
}

export function parseDateInput(value: string, name: string): Date {
  const date = chronoParse(value);
  if (!date)
    throw `Date / time value for option ${style.bold(name)} is invalid.`;
  return date;
}

export function parseNumberInput(value: string, name: string): number {
  const n = parseInt(value);
  if (Number.isNaN(n))
    throw `Number value for option ${style.bold(name)} is invalid.`;
  return n;
}

export function parseTagsInput(tagInput: string[]): string[] {
  const tags: string[] = [];
  for (let tag of tagInput) {
    tag = tag.trim();
    if (tag && !tags.includes(tag)) tags.push(tag);
  }
  return tags;
}
