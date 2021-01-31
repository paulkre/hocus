import columnify from "columnify";
import { Session } from "../../entities/session";
import { dateToTimeString, durationToString } from "../../utils";
import * as style from "../../style";

export function sessionsToList(sessions: Session[]): string {
  return columnify(
    sessions
      .map(({ id, project, start, end, startSeconds, endSeconds }) => [
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
        { label: "", value: "" },
      ])
      .flat()
      .filter((row) => !!row),
    {
      showHeaders: false,
      columnSplitter: "  ",
    }
  );
}
