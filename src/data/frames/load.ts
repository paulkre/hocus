import { readdirSync } from "fs";
import { createFrame, Frame, FrameData } from "./frame";
import { config } from "../../config";
import { createFile } from "../file";
import { MAX_FRAME_DURATION } from ".";

const maxFrameDurationMs = 1000 * MAX_FRAME_DURATION;

type Timespan = {
  from: Date;
  to: Date;
};

function getDataFilenames() {
  return readdirSync(config.dataDirectory, {
    withFileTypes: true,
  })
    .filter(
      (dirent) => dirent.isFile() && dirent.name.match(/^\d\d\d\d-\d\d\.json$/)
    )
    .map((dirent) => dirent.name);
}

function getDateValue(year: number, month: number): number {
  return 12 * year + month;
}

function getRelevantFilename({ from: start, to: end }: Timespan) {
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

  return getDataFilenames().filter((name) => {
    const [yearStr, rest] = name.split("-");
    const [monthStr] = rest.split(".");
    const value = getDateValue(parseInt(yearStr), parseInt(monthStr) - 1);
    return value >= leftBound && value <= rightBound;
  });
}

export async function loadFrames(timespan: Timespan): Promise<Frame[]> {
  const fileContents = await Promise.all(
    getRelevantFilename(timespan).map((filename) =>
      createFile<FrameData[]>(filename).load()
    )
  );

  const fromSeconds = Math.floor(timespan.from.getTime() / 1000);
  const toSeconds = Math.floor(timespan.to.getTime() / 1000);
  const frameData: FrameData[] = [];
  fileContents.forEach((data) => {
    if (data)
      data.forEach((frame) => {
        if (
          (frame.start >= fromSeconds && frame.end <= toSeconds) ||
          (frame.end >= fromSeconds && frame.end <= toSeconds)
        )
          frameData.push(frame);
      });
  });

  return frameData
    .sort((a, b) => a.start - b.start)
    .map((data) => createFrame(data));
}
