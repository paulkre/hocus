import { Result, Ok, Err } from "ts-results";
import { Session } from "../../../entities/session";
import { serializeSession } from "../data";
import { mutateSessions } from "./data";
import { querySessionData } from "../query/data";
import {
  handleAddedSession,
  handleModifiedSession,
  handleRemovedSessions,
} from "../../projects";

async function validateSession(
  newSession: Session
): Promise<Result<void, string>> {
  const items = await querySessionData({
    timespan: {
      from: newSession.start,
      to: newSession.end,
    },
  });

  const { startSeconds: startA, endSeconds: endA } = newSession;
  for (const session of items) {
    const { start: startB, end: endB } = session;
    if (
      newSession.localID !== session.localID &&
      ((startA > startB && startA < endB) ||
        (endA > startB && endA < endB) ||
        (startB > startA && startB < endA) ||
        (endB > startA && endB < endA) ||
        (startA === startB && endA === endB))
    )
      return Err(
        `The session could not be saved / updated because at least one other session already exists during the same time.`
      );
  }

  return Ok(undefined);
}

export async function updateSessionsUnsafe(
  sessions: Session[]
): Promise<Result<void, string>> {
  return mutateSessions(sessions, (items, sessionsInFile) => {
    sessionsInFile.forEach((session) => {
      const index = items.findIndex((data) => data.localID === session.localID);
      if (index >= 0) items.splice(index, 1);
      items.push(serializeSession(session));
    });
    return items;
  });
}

export async function updateSession(
  sessionBefore: Session,
  sessionAfter: Session
): Promise<Result<void, string>> {
  const validation = await validateSession(sessionAfter);
  if (validation.err) return Err(validation.val);

  const updateResult = await mutateSessions([sessionAfter], (items) => {
    const index = items.findIndex(
      (data) => data.localID === sessionAfter.localID
    );
    if (index < 0) return null;
    items.splice(index, 1);
    items.push(serializeSession(sessionAfter));
    return items;
  });

  if (sessionBefore.project.name !== sessionAfter.project.name) {
    await handleRemovedSessions(sessionBefore.project);
    await handleModifiedSession(sessionAfter);
  }

  return updateResult;
}

export async function insertSession(
  session: Session
): Promise<Result<void, string>> {
  const validation = await validateSession(session);
  if (validation.err) return validation;

  const updateResult = await mutateSessions([session], (items) => {
    items.push(serializeSession(session));
    return items;
  });

  await handleAddedSession(session);

  return updateResult;
}

export async function deleteSessionsUnsafe(
  sessions: Session[]
): Promise<Result<void, string>> {
  return mutateSessions(sessions, (data, sessionsInFile) => {
    sessionsInFile.forEach((session) => {
      const index = data.findIndex(
        (other) => other.localID === session.localID
      );
      if (index < 0) return;
      data.splice(index, 1);
    });
    return data;
  });
}

export async function deleteSession(
  session: Session
): Promise<Result<void, string>> {
  const removeResult = await deleteSessionsUnsafe([session]);

  await handleRemovedSessions(session.project);

  return removeResult;
}
