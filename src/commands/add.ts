import { createCommand } from "../command";
import * as style from "../style";
import { createSession } from "../entities/session";
import { insertSession } from "../data/sessions";
import { inquireSessionData } from "../input/inquiry/session-data";
import { parseSessionData } from "../parsing/session-data";
import { logError } from "../utils";

export function createAddCommand() {
  return createCommand("add")
    .arguments("[project] [start] [end]")
    .description(`Add a new ${style.bold("session")} with the given attributes`)
    .action(
      async (
        projectName: string | undefined,
        start: string | undefined,
        end: string | undefined
      ) => {
        const input = await inquireSessionData({
          projectName,
          start,
          end,
        });

        const sessionDataParseResult = await parseSessionData(input);
        if (sessionDataParseResult.err) {
          logError(sessionDataParseResult.val);
          return;
        }

        const session = createSession(sessionDataParseResult.val);

        const sessionInsertResult = await insertSession(session);
        if (sessionInsertResult.err) {
          logError(sessionInsertResult.val);
          return;
        }

        console.log(`New session (${style.bold(session.id)}) saved.`);
      }
    );
}
