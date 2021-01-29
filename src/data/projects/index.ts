import { Result, Ok, Err } from "ts-results";
import {
  createProjectData,
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
import { bold } from "../../style";

export async function findProject(
  name: string
): Promise<Result<Project | undefined, string>> {
  const findResult = await findProjectData(name);
  return findResult.ok
    ? Ok(findResult.val && createProject(findResult.val))
    : findResult;
}

export async function saveProject(
  project: Project,
  sessions?: Session[]
): Promise<Result<void, string>> {
  if (!sessions || !sessions.length) {
    const findResult = await findProjectData(project.name);
    return findResult.ok && findResult.val
      ? saveProjectData({
          ...findResult.val,
          ...project.serialize(),
        })
      : Err(
          `Project ${bold(
            project.name
          )} could not be updated because it does not exist.`
        );
  }
  return saveProjectData(createProjectData(project, sessions));
}

export async function deleteProject(
  project: Project
): Promise<Result<void, string>> {
  const queryResult = await getSessionsForProject(project);
  if (queryResult.err) return queryResult;

  const deleteResult = await deleteSessionsUnsafe(queryResult.val);
  if (deleteResult.err) return deleteResult;

  return mutateProjects((data) => {
    const index = data.findIndex((data) => data.name === project.name);
    if (index >= 0) data.splice(index, 1);
    return data;
  });
}

function resolveTimespan(data: [number, number]): Timespan {
  const [from, to] = data.map((seconds) => new Date(1000 * seconds));
  return { from, to };
}

export async function getSessionsForProject(
  project: Project,
  filter?: Filter
): Promise<Result<Session[], string>> {
  const findResult = await findProjectData(project.name);
  if (findResult.err) return findResult;

  return findResult.val
    ? querySessions({
        ...filter,
        project: project.name,
        timespan: resolveTimespan(findResult.val.timespan),
      })
    : Ok([]);
}

export async function handleRemovedSessions(
  project: Project
): Promise<Result<void, string>> {
  const findResult = await findProjectData(project.name);
  if (findResult.err) return findResult;
  if (!findResult.val)
    return Err("Failed to modify project data after removing sessions.");
  const data = findResult.val;

  const queryResult = await querySessionData({
    project: project.name,
    timespan: resolveTimespan(data.timespan),
  });
  if (queryResult.err) return queryResult;

  const sessionData = queryResult.val;

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
  const findResult = await findProjectData(session.project.name);
  if (findResult.err) return findResult;
  if (!findResult.val)
    return Err("Failed to update project data after editing session.");
  const projectData = findResult.val;

  const queryResult = await querySessionData({
    project: projectData.name,
    timespan: {
      from: new Date(
        1000 * Math.min(projectData.timespan[0], session.startSeconds)
      ),
      to: new Date(
        1000 * Math.max(projectData.timespan[1], session.endSeconds)
      ),
    },
  });
  if (queryResult.err) return queryResult;

  const sessionData = queryResult.val;

  const earliestSession = sessionData[0];
  const latestSession = sessionData[sessionData.length - 1];
  return saveProjectData({
    ...projectData,
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

  const findResult = await findProjectData(project.name);
  if (findResult.err) return findResult;

  const data = findResult.val;

  let [{ startSeconds: from, endSeconds: to }] = sessions;
  if (sessions.length > 1) to = sessions[sessions.length - 1].endSeconds;
  if (data) {
    from = Math.min(from, data.timespan[0]);
    to = Math.max(to, data.timespan[1]);
  }

  let sessionCount = sessions.length;
  if (data) sessionCount += data.sessionCount;

  return saveProjectData({
    ...project.serialize(),
    sessionCount,
    timespan: [from, to],
  });
}

export async function handleAddedSession(
  session: Session
): Promise<Result<void, string>> {
  return handleAddedSessions([session], session.project);
}
