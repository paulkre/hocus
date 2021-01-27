import columnify from "columnify";
import { Session } from "../../entities/session";
import * as style from "../../style";
import { dateToInputDefault } from "../../utils";

export function displayChanges(session: Session, editedSession: Session) {
  const changes: [string, string, string][] = [];
  if (session.project.name !== editedSession.project.name)
    changes.push([
      "project",
      session.project.name,
      style.project(editedSession.project.name),
    ]);

  if (session.startSeconds !== editedSession.startSeconds)
    changes.push([
      "start",
      dateToInputDefault(session.start),
      style.date(dateToInputDefault(editedSession.start)),
    ]);

  if (session.endSeconds !== editedSession.endSeconds)
    changes.push([
      "end",
      dateToInputDefault(session.end),
      style.date(dateToInputDefault(editedSession.end)),
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
    changes.push([
      "tags",
      `[${tagsA ? tagsA.join(", ") : ""}]`,
      `[${tagsB ? tagsB.map((tag) => style.tag(tag)).join(", ") : ""}]`,
    ]);

  console.log(
    `The following changes to session ${style.bold(session.id)} were made:`
  );
  console.log(
    columnify(
      changes.map(([name, before, after]) => ({
        name: `${name}:`,
        before,
        arrow: "=>",
        after,
      })),
      {
        showHeaders: false,
        maxWidth: 20,
        columnSplitter: "   ",
        config: {
          name: {
            minWidth: 14,
            align: "right",
          },
        },
      }
    )
  );

  if (session.id !== editedSession.id) {
    console.log();
    console.log(
      `The updated ID for session ${style.bold(session.id)} is now ${style.bold(
        editedSession.id
      )}.`
    );
  }
}
