import { join as pathJoin } from "path";
import { Session, SessionData } from "..";
import { restoreSession } from "../creation";
import { config } from "../../../config";
import { createFile } from "../../file";

import {
  filterFilenamesByTimespan,
  filterDataByTimespan,
  Timespan,
} from "./timespan";
import { getFilenames } from "./filenames";

export * from "./single";

export type Filter = {
  timespan?: Timespan;
  first?: number;
  last?: number;
  tags?: string[];
};

function filterDataByTags(data: SessionData[], tags: string[]) {
  return data.filter((session) => {
    if (!session.tags) return false;
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
    const contents = await createFile<SessionData[]>(
      pathJoin(config.dataDirectory, filenames[i])
    ).load();
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
  let filenames = getFilenames();
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
  return (await loadData(filter)).map((session) => restoreSession(session));
}
