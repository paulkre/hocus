import { join as pathJoin } from "path";
import { readdirSync } from "fs";
import { createSession, Session, SessionData } from "../session";
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
  tags?: string[];
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

function filterDataByTags(data: SessionData[], tags: string[]) {
  return data.filter((session) => {
    for (const tag of session.tags) if (tags.includes(tag)) return true;
    return false;
  });
}

async function loadDataOfFirstFew(
  filenames: string[],
  first: number
): Promise<SessionData[]> {
  let data: SessionData[] = [];
  let i = 0;
  do {
    const contents = await createFile<SessionData[]>(filenames[i]).load();
    i++;
    if (contents) data = data.concat(contents);
  } while ((!data.length || data.length < first) && i < filenames.length);
  return data;
}

async function loadData({
  timespan,
  first,
  last,
  tags,
}: Filter): Promise<SessionData[]> {
  let filenames = getDataFilenames();
  if (!filenames.length) return [];

  if (first && !last && !timespan)
    return (await loadDataOfFirstFew(filenames, first)).slice(0, first);
  if (last && !first && !timespan)
    return (await loadDataOfFirstFew(filenames.reverse(), last)).slice(-last);

  if (timespan) filenames = filterFilenamesByTimespan(filenames, timespan);

  const fileContents = await Promise.all(
    filenames.map((filename) =>
      createFile<SessionData[]>(pathJoin(config.dataDirectory, filename)).load()
    )
  );

  let sessionData: SessionData[] = [];
  fileContents.forEach((data) => {
    if (data) sessionData = sessionData.concat(data);
  });

  if (timespan) sessionData = filterDataByTimespan(sessionData, timespan);

  if (first) sessionData = sessionData.slice(0, first);
  if (last) sessionData = sessionData.slice(-last);
  if (tags && tags.length) sessionData = filterDataByTags(sessionData, tags);

  return sessionData;
}

export async function loadSessions(filter: Filter): Promise<Session[]> {
  return (await loadData(filter)).map((session) => createSession(session));
}
