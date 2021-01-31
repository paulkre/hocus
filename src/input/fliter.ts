import { createCommand } from "../command";
import * as style from "../style";

export type FilterOptions = {
  project?: string;
  from?: string;
  to?: string;
  first?: string;
  last?: string;
  tags?: string[];
  client?: string;
};

export function wrapCommandWithFilterOptions(
  command: ReturnType<typeof createCommand>
) {
  return command
    .option(
      "-p, --project <project>",
      `The ${style.bold("project")} every included ${style.bold(
        "session"
      )} must have`
    )
    .option(
      "-f, --from <from>",
      `The ${style.bold(
        "date"
      )} from which the output should start including data`
    )
    .option(
      "-t, --to <to>",
      `The ${style.bold("date")} at which the output should stop including data`
    )
    .option(
      "--first <first>",
      `The number of ${style.bold(
        "sessions"
      )} to include from the beginning of the selection`
    )
    .option(
      "--last <last>",
      `The number of ${style.bold(
        "sessions"
      )} to include from the end of the selection`
    )
    .option(
      "-T, --tags <tags...>",
      `The tag names every included ${style.bold(
        "session"
      )} must have (comma or space separated)`
    )
    .option(
      "-c, --client <client>",
      `The client name every included ${style.bold("session")} must have`
    );
}
