import { parseDate as chronoParse } from "chrono-node";

export function parseDate(value: string): Date | null {
  return chronoParse(value);
}

export function parseString(value: string): string | null {
  return value.replace(/[^A-Za-z0-9-\.]+/, "").trim() || null;
}

export function parseTags(input: string[]): string[] {
  const tags: string[] = [];
  input.forEach((tagString) => {
    tagString.split(",").forEach((tag) => {
      const parsedTag = parseString(tag);
      if (parsedTag && !tags.includes(parsedTag)) tags.push(parsedTag);
    });
  });
  return tags.sort((a, b) => a.localeCompare(b));
}
