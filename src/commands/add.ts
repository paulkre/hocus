import { createCommand } from "../command";
import * as style from "../style";
import { createSession } from "../entities/session";
import { querySessions, saveSession } from "../data/sessions";
import { inquireSessionData } from "../input/inquiry/session-data";
import { parseSessionData, SessionDataInput } from "../parsing/session-data";
import { logError } from "../utils";

export function createAddCommand() {
  return createCommand("add")
    .arguments("[project] [start] [end]")
    .description(`Add a new ${style.bold("session")} with the given attributes`)
    .action(
      async (
        project: string | undefined,
        start: string | undefined,
        end: string | undefined
      ) => {
        const cmdInput: Partial<SessionDataInput> = {
          project,
          start,
          end,
        };
        const existing: string[] = [];
        if (project) existing.push("project");
        if (start) existing.push("start");
        if (end) existing.push("end");

        const [lastSession] = await querySessions({ last: 1 });
        const input = await inquireSessionData(
          { project: lastSession && lastSession.project.name },
          existing
        );

        const sessionDataParseResult = await parseSessionData({
          ...cmdInput,
          ...input,
        });
        if (sessionDataParseResult.err) {
          logError(sessionDataParseResult.val);
          return;
        }

        const session = createSession(sessionDataParseResult.val);

        const sessionStoreResult = await saveSession(session);
        if (sessionStoreResult.err) {
          logError(sessionStoreResult.val);
          return;
        }

        console.log(`New session (${style.bold(session.id)}) saved.`);
      }
    );
}
