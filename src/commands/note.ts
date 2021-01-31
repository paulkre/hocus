import { Result, Ok, Err } from "ts-results";
import { createCommand } from "../command";
import { loadState, storeState } from "../data/state";
import { logError } from "../utils";
import * as style from "../style";
import { findSession, querySessions, updateSession } from "../data/sessions";
import { Session } from "../entities/session";
import { requestEditViaEditor } from "../input/editor/editor";
import { format as formatDate } from "date-and-time";

type SessionLike = {
  id: string;
  projectName: string;
  start: Date;
  notes?: string;
};

function requestNotesViaEditor({ id, projectName, start, notes }: SessionLike) {
  return requestEditViaEditor(
    `notes-${id}.md`,
    notes ||
      `# ${projectName} - ${formatDate(start, "YYYY-MM-DD")}

`
  );
}

async function handleSession(session: Session): Promise<Result<void, string>> {
  const editedNotes = await requestNotesViaEditor({
    id: session.id,
    projectName: session.project.name,
    start: session.start,
    notes: session.notes,
  });

  return updateSession(
    session,
    session.mutate({ notes: editedNotes || undefined })
  );
}

async function editNote(id?: string): Promise<Result<void, string>> {
  if (id) {
    const findResult = await findSession(id);
    if (findResult.err) return findResult;
    if (!findResult.val)
      return Err(`Session ${style.bold(id)} could not be found.`);
    return handleSession(findResult.val);
  }

  const loadResult = await loadState();
  if (loadResult.err) return loadResult;
  const state = loadResult.val;
  const { currentSession } = state;

  if (!currentSession) {
    const queryResult = await querySessions({ last: 1 });
    if (queryResult.err) return queryResult;
    if (queryResult.val.length) return handleSession(queryResult.val[0]);

    console.log("There are no sessions to modify.");
    return Ok(undefined);
  }

  const editedNotes = await requestNotesViaEditor({
    id: "current",
    projectName: currentSession.project.name,
    start: currentSession.start,
    notes: currentSession.notes,
  });

  await storeState({
    ...state,
    currentSession: {
      ...currentSession,
      notes: editedNotes || undefined,
    },
  });

  return Ok(undefined);
}

export function createNoteCommand() {
  return createCommand("note")
    .arguments("[id]")
    .description(
      `Edit the notes for a given ${style.bold(
        "session"
      )} (defaults to the current or most recent session)`
    )
    .action(async (id?: string) => {
      const editResult = await editNote(id);
      if (editResult.err) logError(editResult.val);
    });
}
