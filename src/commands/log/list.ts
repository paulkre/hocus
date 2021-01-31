import columnify from "columnify";
import { Session } from "../../entities/session";
import { dateToTimeString, durationToString } from "../../utils";
import * as style from "../../style";
import { EOL } from "os";

export function sessionsToList(sessions: Session[]): string {
  let output = "";
  for (const {
    id,
    project,
    start,
    end,
    startSeconds,
    endSeconds,
    notes,
  } of sessions) {
    output += columnify(
      [
        { label: "Session:", value: style.light(id) },
        { label: "Project:", value: style.project(project.name) },
        project.client
          ? {
              label: "Client:",
              value: style.client(project.client),
            }
          : undefined,
        { label: "Start:", value: style.time(dateToTimeString(start)) },
        { label: "End:", value: style.time(dateToTimeString(end)) },
        {
          label: "Duration:",
          value: style.bold(durationToString(endSeconds - startSeconds)),
        },
      ].filter((row) => !!row),
      {
        showHeaders: false,
        columnSplitter: "  ",
      }
    );

    if (notes) {
      const trimmedNotes = notes.replace(/^\s+|\s+$/g, "");
      if (trimmedNotes) {
        output +=
          EOL + style.light(trimmedNotes.replace(/^|\n/g, "\n  ")) + EOL;
      }
    }

    output += EOL;
  }

  return output;
}
