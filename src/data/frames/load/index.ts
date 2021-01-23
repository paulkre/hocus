import { readdirSync } from "fs";
import { createFrame, Frame, FrameData } from "../frame";
import { config } from "../../../config";
import { createFile } from "../../file";

import {
  filterFilenamesByTimespan,
  filterDataByTimespan,
  Timespan,
} from "./timespan";

type Filter = {
  timespan?: Timespan;
  first?: number;
  last?: number;
};

function getDataFilenames() {
  return readdirSync(config.dataDirectory, {
    withFileTypes: true,
  })
    .filter(
      (dirent) => dirent.isFile() && dirent.name.match(/^\d\d\d\d-\d\d\.json$/)
    )
    .map((dirent) => dirent.name)
    .sort((a, b) => a.localeCompare(b));
}

async function loadDataOfFirstFew(
  filenames: string[],
  first: number
): Promise<FrameData[]> {
  let data: FrameData[] = [];
  let i = 0;
  do {
    const contents = await createFile<FrameData[]>(filenames[i]).load();
    i++;
    if (contents) data = data.concat(contents);
  } while ((!data.length || data.length < first) && i < filenames.length);
  return data;
}

async function loadData({
  timespan,
  first,
  last,
}: Filter): Promise<FrameData[]> {
  let filenames = getDataFilenames();
  if (!filenames.length) return [];

  if (first && !last && !timespan)
    return (await loadDataOfFirstFew(filenames, first)).slice(0, first);
  if (last && !first && !timespan)
    return (await loadDataOfFirstFew(filenames.reverse(), last)).slice(-last);

  if (timespan) filenames = filterFilenamesByTimespan(filenames, timespan);

  const fileContents = await Promise.all(
    filenames.map((filename) => createFile<FrameData[]>(filename).load())
  );

  let frameData: FrameData[] = [];
  fileContents.forEach((data) => {
    if (data) frameData = frameData.concat(data);
  });

  if (timespan) frameData = filterDataByTimespan(frameData, timespan);

  if (first) frameData = frameData.slice(0, first);
  if (last) frameData = frameData.slice(-last);

  return frameData;
}

export async function loadFrames(filter: Filter): Promise<Frame[]> {
  return (await loadData(filter)).map((frame) => createFrame(frame));
}
