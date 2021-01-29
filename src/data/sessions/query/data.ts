import {
  dateToSessionFilename,
  getSessionsFile,
  getSessionFilenames,
  SessionData,
} from "../data";
import {
  filterFilenamesByTimespan,
  filterDataByTimespan,
  Timespan,
} from "./timespan";
import { dateIDToDate } from "../../../entities/session";

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
    const result = await getSessionsFile(filenames[i]).load();
    i++;
    if (result.ok) data = data.concat(result.val);
  } while (data.length < first && i < filenames.length);
  return data;
}

export async function querySessionData({
  project,
  timespan,
  first,
  last,
  tags,
}: Filter): Promise<SessionData[]> {
  let filenames = getSessionFilenames();
  if (!filenames.length) return [];

  if (first && !last && !timespan && !project)
    return (await loadDataOfFirstFew(filenames, first)).slice(0, first);
  if (last && !first && !timespan && !project)
    return (await loadDataOfFirstFew(filenames.reverse(), last)).slice(-last);

  if (timespan) filenames = filterFilenamesByTimespan(filenames, timespan);

  const results = await Promise.all(
    filenames.map((filename) => getSessionsFile(filename).load())
  );

  let sessionData: SessionData[] = [];
  results.forEach((result) => {
    if (result.ok) sessionData = sessionData.concat(result.val);
  });

  if (timespan) sessionData = filterDataByTimespan(sessionData, timespan);

  if (project)
    sessionData = sessionData.filter((session) => session.project === project);

  if (tags && tags.length) sessionData = filterDataByTags(sessionData, tags);

  if (first || last) {
    let slicedData: SessionData[] = [];
    if (first) slicedData = sessionData.slice(0, first);
    if (last) slicedData = [...slicedData, ...sessionData.slice(-last)];
    return slicedData;
  }

  return sessionData;
}

export async function findSessionData(
  id: string
): Promise<SessionData | undefined> {
  if (!id.match(/^[a-z0-9]{8}$/)) return undefined;
  const dateID = id.slice(0, 3);
  const localID = id.slice(3, 8);

  const result = await getSessionsFile(
    dateToSessionFilename(dateIDToDate(dateID))
  ).load();
  if (result.err) return undefined;

  return result.val.find((data) => data.localID === localID);
}
