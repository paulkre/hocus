import { SESSION_MAX_DURATION, SessionData } from "../data";

const maxDurationMs = 1000 * SESSION_MAX_DURATION;

export type Timespan = {
  from: Date;
  to: Date;
};

function getDateValue(year: number, month: number): number {
  return 12 * year + month;
}

export function filterFilenamesByTimespan(
  filenames: string[],
  { from: start, to: end }: Timespan
) {
  const leftBoundDate = new Date(start.getTime() - maxDurationMs);
  const rightBoundDate = new Date(end.getTime() + maxDurationMs);

  const leftBound = getDateValue(
    leftBoundDate.getFullYear(),
    leftBoundDate.getMonth()
  );
  const rightBound = getDateValue(
    rightBoundDate.getFullYear(),
    rightBoundDate.getMonth()
  );

  return filenames.filter((name) => {
    const [yearStr, rest] = name.split("-");
    const [monthStr] = rest.split(".");
    const value = getDateValue(parseInt(yearStr), parseInt(monthStr) - 1);
    return value >= leftBound && value <= rightBound;
  });
}

export function filterDataByTimespan(
  contents: SessionData[],
  { from, to }: Timespan
) {
  const fromSeconds = Math.floor(from.getTime() / 1000);
  const toSeconds = Math.floor(to.getTime() / 1000);

  return contents.filter(
    (session) =>
      (session.start >= fromSeconds && session.end <= toSeconds) ||
      (session.end >= fromSeconds && session.end <= toSeconds)
  );
}
