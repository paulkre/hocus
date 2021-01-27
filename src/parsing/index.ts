import { parseDate as chronoParse } from "chrono-node";

export function parseDate(value: string): Date | null {
  return chronoParse(value);
}

export function parseName(value: string): string | null {
  return value.replace(/[^A-Za-z0-9-\.]+/, "").trim() || null;
}

export function parseTags(input: string): string[] | undefined {
  const tags: string[] = [];
  input.split(" ").forEach((tagString) => {
    tagString.split(",").forEach((tag) => {
      const parsedTag = parseName(tag);
      if (parsedTag && !tags.includes(parsedTag)) tags.push(parsedTag);
    });
  });
  return tags.length ? tags.sort((a, b) => a.localeCompare(b)) : undefined;
}
