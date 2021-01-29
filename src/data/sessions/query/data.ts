import { Result, Ok, Err } from "ts-results";
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
import { bold } from "../../../style";

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
): Promise<Result<SessionData[], string>> {
  let data: SessionData[] = [];
  let i = 0;
  do {
    const result = await getSessionsFile(filenames[i]).load();
    i++;
    if (result.err) return result;
    data = data.concat(result.val);
  } while (data.length < first && i < filenames.length);
  return Ok(data);
}

export async function querySessionData({
  project,
  timespan,
  first,
  last,
  tags,
}: Filter): Promise<Result<SessionData[], string>> {
  let filenames = getSessionFilenames();
  if (!filenames.length) return Ok([]);

  if (first && !last && !timespan && !project) {
    const result = await loadDataOfFirstFew(filenames, first);
    return result.ok ? Ok(result.val.slice(0, first)) : result;
  }
  if (last && !first && !timespan && !project) {
    const result = await loadDataOfFirstFew(filenames.reverse(), last);
    return result.ok ? Ok(result.val.slice(-last)) : result;
  }

  if (timespan) filenames = filterFilenamesByTimespan(filenames, timespan);

  const loadResult = Result.all(
    ...(await Promise.all(
      filenames.map((filename) => getSessionsFile(filename).load())
    ))
  );
  if (loadResult.err) return loadResult;

  let sessionData = loadResult.val.flat();

  if (timespan) sessionData = filterDataByTimespan(sessionData, timespan);

  if (project)
    sessionData = sessionData.filter((session) => session.project === project);

  if (tags && tags.length) sessionData = filterDataByTags(sessionData, tags);

  if (first || last) {
    let slicedData: SessionData[] = [];
    if (first) slicedData = sessionData.slice(0, first);
    if (last) slicedData = [...slicedData, ...sessionData.slice(-last)];
    return Ok(slicedData);
  }

  return Ok(sessionData);
}

export async function findSessionData(
  id: string
): Promise<Result<SessionData | undefined, string>> {
  if (!id.match(/^[a-z0-9]{8}$/))
    return Err(`Provided ID ${bold(id)} is invalid.`);
  const dateID = id.slice(0, 3);
  const localID = id.slice(3, 8);

  const loadResult = await getSessionsFile(
    dateToSessionFilename(dateIDToDate(dateID))
  ).load();

  return loadResult.ok
    ? Ok(loadResult.val.find((data) => data.localID === localID))
    : loadResult;
}
