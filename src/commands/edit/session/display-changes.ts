import {
  displayChanges as displayChangesBase,
  ChangeMap,
} from "../display-changes";
import { Session } from "../../../entities/session";
import * as style from "../../../style";
import { dateToInputDefault } from "../../../utils";

export function displayChanges(session: Session, editedSession: Session) {
  const changes: ChangeMap = new Map();

  if (session.project.name !== editedSession.project.name)
    changes.set("Project", [
      session.project.name,
      style.project(editedSession.project.name),
    ]);

  if (session.startSeconds !== editedSession.startSeconds)
    changes.set("Start-Date", [
      dateToInputDefault(session.start),
      style.time(dateToInputDefault(editedSession.start)),
    ]);

  if (session.endSeconds !== editedSession.endSeconds)
    changes.set("End-Date", [
      dateToInputDefault(session.end),
      style.time(dateToInputDefault(editedSession.end)),
    ]);

  const tagsA = session.tags;
  const tagsB = editedSession.tags;
  if (
    tagsA !== tagsB ||
    (tagsA &&
      tagsB &&
      (tagsA.length !== tagsB.length ||
        !tagsA!.every((tag, i) => tag === tagsB![i])))
  )
    changes.set("Tags", [
      `[${tagsA ? tagsA.join(", ") : ""}]`,
      `[${tagsB ? tagsB.map((tag) => style.tag(tag)).join(", ") : ""}]`,
    ]);

  console.log(
    `The following changes to session ${style.session(session.id)} were made:`
  );

  displayChangesBase(changes);

  if (session.id !== editedSession.id) {
    console.log();
    console.log(
      `The updated ID for session ${style.bold(
        session.id
      )} is now ${style.session(editedSession.id)}.`
    );
  }
}
