import columnify from "columnify";
import { Session } from "../../data/session";
import * as style from "../../style";
import { dateToInputDefault } from "../../utils";

export function displayChanges(session: Session, editedSession: Session) {
  const changes: [string, string, string][] = [];
  if (session.project !== editedSession.project)
    changes.push([
      "project",
      session.project,
      style.project(editedSession.project),
    ]);

  if (session.data.start !== editedSession.data.start)
    changes.push([
      "start",
      dateToInputDefault(session.start),
      style.date(dateToInputDefault(editedSession.start)),
    ]);

  if (session.data.end !== editedSession.data.end)
    changes.push([
      "end",
      dateToInputDefault(session.end),
      style.date(dateToInputDefault(editedSession.end)),
    ]);

  if (
    session.tags.length !== editedSession.tags.length ||
    !session.tags.every((tag, i) => tag === editedSession.tags[i])
  )
    changes.push([
      "tags",
      `[${session.tags.join(", ")}]`,
      `[${editedSession.tags.map((tag) => style.tag(tag)).join(", ")}]`,
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
