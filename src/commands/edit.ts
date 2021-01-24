import { prompt } from "inquirer";
import { createCommand } from "../command";
import {
  loadSessions,
  loadSingleSession,
  restoreSession,
  sessionsAreEqual,
  Session,
  storeSession,
} from "../data/session";
import * as style from "../style";
import {
  dateToDayString,
  dateToTimeString,
  logError,
  humanizeTags,
  parseDateInput,
  parseTagsInput,
  dateToDateTimeString,
} from "../utils";
import { format as formatDate } from "date-and-time";
import { Err, Ok, Result } from "ts-results";
import columnify from "columnify";

function dateToInputDefault(date: Date) {
  return formatDate(date, "YYYY-MM-DD HH:mm:ss");
}

async function loadLastSessionID() {
  const result = await loadSessions({ last: 1 });
  return result.length ? result[0].id : null;
}

type InquiryInput = {
  project: string;
  start: string;
  end: string;
  tags: string;
};

function parseInquiryInput(
  input: InquiryInput,
  localID: string
): Result<Session, string> {
  const start = Math.floor(
    parseDateInput(input.start, "start").getTime() / 1000
  );
  const end = Math.floor(parseDateInput(input.end, "end").getTime() / 1000);

  if (start > end) return new Err("Session cannot end before it starts.");

  return new Ok(
    restoreSession({
      localID,
      project: input.project,
      start,
      end,
      tags: parseTagsInput(input.tags.split(" ")),
    })
  );
}

function displayChanges(session: Session, editedSession: Session) {
  const changes: [string, string, string][] = [];
  if (session.project !== editedSession.project)
    changes.push([
      "Project",
      session.project,
      style.project(editedSession.project),
    ]);

  if (session.data.start !== editedSession.data.start)
    changes.push([
      "Start",
      dateToInputDefault(session.start),
      style.date(dateToInputDefault(editedSession.start)),
    ]);

  if (session.data.end !== editedSession.data.end)
    changes.push([
      "End",
      dateToInputDefault(session.end),
      style.date(dateToInputDefault(editedSession.end)),
    ]);

  if (
    session.tags.length !== editedSession.tags.length ||
    !session.tags.every((tag, i) => tag === editedSession.tags[i])
  )
    changes.push([
      "Tags",
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

export function createEditCommand() {
  return createCommand("edit")
    .arguments("[id]")
    .description(
      `Modify the attributes of a ${style.project(
        "session"
      )} with the given ${style.bold("ID")}`
    )
    .action(async (id: string | undefined) => {
      if (!id) {
        const lastID = await loadLastSessionID();

        id = (
          await prompt<{ id: string }>([
            {
              name: "id",
              message: `Which session (${style.bold(
                "ID"
              )}) do you want to edit?`,
              default: lastID,
            },
          ])
        ).id;
      }

      const session = await loadSingleSession(id);
      if (!session) {
        logError(`Session with ID ${style.bold(id)} could not be found.`);
        return;
      }

      console.log(`Editing session ${style.bold(id)}:`);
      console.log(
        `Recorded for project ${style.project(
          session.project
        )} on ${dateToDayString(session.start)} from ${dateToTimeString(
          session.start
        )} to ${dateToTimeString(session.end)}${
          session.tags.length
            ? ` with tag${session.tags.length > 1 ? "s" : ""} ${humanizeTags(
                session.tags
              )}`
            : ""
        }.`
      );
      console.log();

      const input = await prompt<InquiryInput>([
        {
          name: "project",
          message: "What do you want to call the project",
          default: session.project,
        },
        {
          name: "start",
          message: "When should the session start?",
          default: dateToInputDefault(session.start),
        },
        {
          name: "end",
          message: "When should the session end?",
          default: dateToInputDefault(session.end),
        },
        {
          name: "tags",
          message: "Which tags should the session use?",
          default: session.tags ? session.tags.join(", ") : "",
        },
      ]);
      console.log();

      const inquiryResult = parseInquiryInput(input, session.id.split("-")[0]);
      if (inquiryResult.err) {
        logError(inquiryResult.val);
        return;
      }

      const editedSession = inquiryResult.val;

      if (sessionsAreEqual(session, editedSession)) {
        console.log("No changes were made.");
        return;
      }

      const storeResult = await storeSession(editedSession);
      if (storeResult.err) {
        logError(storeResult.val);
        return;
      }

      displayChanges(session, editedSession);
    });
}
