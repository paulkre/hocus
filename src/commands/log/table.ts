import columnify from "columnify";
import { Session } from "../../entities/session";
import { dateToTimeString, durationToString, limitString } from "../../utils";
import * as style from "../../style";

export function sessionsToTable(sessions: Session[]): string {
  return columnify(
    sessions.map(
      ({ id, project, start, end, startSeconds, endSeconds, tags }) => ({
        id: style.light(id),
        from: style.time(dateToTimeString(start)),
        sep0: "to",
        to: style.time(dateToTimeString(end)),
        duration: style.bold(durationToString(endSeconds - startSeconds)),
        project: style.project(limitString(project.name, 20)),
        client: project.client
          ? style.client(limitString(project.client, 10))
          : "",
        tags: tags
          ? `[${tags.map((tag) => style.tag(limitString(tag, 10))).join(", ")}]`
          : "",
      })
    ),
    {
      showHeaders: false,
      columnSplitter: "    ",
      config: {
        id: {
          minWidth: 14,
          align: "right",
        },
        duration: { align: "right" },
        project: { align: "right" },
      },
    }
  );
}
