import { Result, Ok } from "ts-results";
import {
  projectToData,
  mutateProjects,
  saveProjectData,
  findProjectData,
  ProjectData,
} from "./data";
import { createProject, Project } from "../../entities/project";
import { Session } from "../../entities/session";
import { querySessions } from "../sessions";
import { querySessionData, Filter } from "../sessions/query/data";
import { Timespan } from "../sessions/query/timespan";
import { deleteSessionsUnsafe } from "../sessions";

export async function findProject(name: string): Promise<Project | undefined> {
  const data = await findProjectData(name);
  return data && createProject(data);
}

export async function saveProject(
  project: Project
): Promise<Result<void, string>> {
  return saveProjectData(projectToData(project));
}

export async function deleteProject(
  project: Project
): Promise<Result<void, string>> {
  const mutateResult = await mutateProjects((data) => {
    const index = data.findIndex((data) => data.name === project.name);
    if (index >= 0) data.splice(index, 1);
    return data;
  });

  await deleteSessionsUnsafe(await getSessionsForProject(project));

  return mutateResult;
}

function resolveTimespan(data: [number, number]): Timespan {
  const [from, to] = data.map((seconds) => new Date(1000 * seconds));
  return { from, to };
}

export async function getSessionsForProject(
  project: Project,
  filter?: Filter
): Promise<Session[]> {
  const data = await findProjectData(project.name);
  if (!data || !data.timespan) return [];
  return querySessions({
    ...filter,
    project: project.name,
    timespan: resolveTimespan(data.timespan),
  });
}

function getSessionDataForProject(data: ProjectData) {
  return querySessionData({
    project: data.name,
    timespan: resolveTimespan(data.timespan!),
  });
}

export async function handleRemovedSessions(project: Project) {
  const data = (await findProjectData(project.name))!;
  const sessionData = await getSessionDataForProject(data);

  if (!sessionData.length) return deleteProject(project);

  const earliestSession = sessionData[0];
  const latestSession = sessionData[sessionData.length - 1];
  return saveProjectData({
    ...data,
    sessionCount: sessionData.length,
    timespan: [earliestSession.start, latestSession.end],
  });
}

export async function handleModifiedSession(
  session: Session
): Promise<Result<void, string>> {
  const data = (await findProjectData(session.project.name))!;
  const sessionData = await getSessionDataForProject(data);

  const earliestSession = sessionData[0];
  const latestSession = sessionData[sessionData.length - 1];
  return saveProjectData({
    ...data,
    timespan: [
      Math.min(session.startSeconds, earliestSession.start),
      Math.max(session.endSeconds, latestSession.end),
    ],
  });
}

export async function handleAddedSessions(
  sessions: Session[],
  project: Project
): Promise<Result<void, string>> {
  if (!sessions.length) return Ok(undefined);

  const data = await findProjectData(project.name);

  let [{ startSeconds: from, endSeconds: to }] = sessions;
  if (sessions.length > 1) to = sessions[sessions.length - 1].endSeconds;
  if (data && data.timespan) {
    from = Math.min(from, data.timespan[0]);
    to = Math.max(to, data.timespan[1]);
  }

  let sessionCount = sessions.length;
  if (data && data.sessionCount) sessionCount += data.sessionCount;

  return saveProjectData(
    projectToData(project, {
      sessionCount,
      timespan: [from, to],
    })
  );
}

export async function handleAddedSession(
  session: Session
): Promise<Result<void, string>> {
  return handleAddedSessions([session], session.project);
}
