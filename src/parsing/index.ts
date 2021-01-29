import { parseDate as chronoParse } from "chrono-node";

export function parseDate(value: string): Date | null {
  return chronoParse(value);
}

export function parseName(value: string): string | undefined {
  return value.replace(/[^A-Za-z0-9-\.]+/, "").trim() || undefined;
}

export function parseTags(input: string | string[]): string[] | undefined {
  if (!Array.isArray(input)) input = [input];
  const tags: string[] = [];
  input.forEach((str1) => {
    str1.split(" ").forEach((str2) => {
      str2.split(",").forEach((str3) => {
        const parsedTag = parseName(str3);
        if (parsedTag && !tags.includes(parsedTag)) tags.push(parsedTag);
      });
    });
  });
  return tags.length ? tags.sort((a, b) => a.localeCompare(b)) : undefined;
}
