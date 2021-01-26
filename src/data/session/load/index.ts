import { Session } from "../../../entities/session";
import { createSessionFile, createSessionFromData, SessionData } from "../data";

import {
  filterFilenamesByTimespan,
  filterDataByTimespan,
  Timespan,
} from "./timespan";
import { getFilenames } from "./filenames";

export * from "./single";

export type Filter = {
  project?: string;
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
    const content = await createSessionFile(filenames[i]).load();
    i++;
    if (content) data = data.concat(content);
  } while (data.length < first && i < filenames.length);
  return data;
}

async function loadData({
  project,
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
    filenames.map((filename) => createSessionFile(filename).load())
  );

  let sessionData: SessionData[] = [];
  fileContents.forEach((data) => {
    if (data) sessionData = sessionData.concat(data);
  });

  if (timespan) sessionData = filterDataByTimespan(sessionData, timespan);

  if (project)
    sessionData = sessionData.filter((session) => session.project === project);

  if (first) sessionData = sessionData.slice(0, first);
  if (last) sessionData = sessionData.slice(-last);
  if (tags && tags.length) sessionData = filterDataByTags(sessionData, tags);

  return sessionData;
}

export async function loadSessions(filter: Filter): Promise<Session[]> {
  return (await loadData(filter)).map((session) =>
    createSessionFromData(session)
  );
}
