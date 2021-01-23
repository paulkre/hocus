import { FrameData } from "../frame";
import { MAX_FRAME_DURATION } from "..";

const maxFrameDurationMs = 1000 * MAX_FRAME_DURATION;

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
  const leftBoundDate = new Date(start.getTime() - maxFrameDurationMs);
  const rightBoundDate = new Date(end.getTime() + maxFrameDurationMs);

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
  contents: FrameData[],
  { from, to }: Timespan
) {
  const fromSeconds = Math.floor(from.getTime() / 1000);
  const toSeconds = Math.floor(to.getTime() / 1000);

  return contents.filter(
    (frame) =>
      (frame.start >= fromSeconds && frame.end <= toSeconds) ||
      (frame.end >= fromSeconds && frame.end <= toSeconds)
  );
}
