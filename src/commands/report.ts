import { Result, Ok } from "ts-results";
import { createCommand } from "../command";
import { dateToDayString, durationToString, logError } from "../utils";
import { wrapCommandWithFilterOptions, FilterOptions } from "../input/fliter";
import { resolveFilter } from "../resolve/filter";
import * as style from "../style";
import { EOL } from "os";
import { outputText } from "../output/text";
import columnify from "columnify";

type TreeNode<T = undefined> = { totalSeconds: number; tree: T };
type TableRow = { label: string; value: string };

async function displayReport(
  options: FilterOptions
): Promise<Result<void, string>> {
  const resolveResult = await resolveFilter(options);
  if (resolveResult.err) return resolveResult;

  const sessions = resolveResult.val;
  if (!sessions) return Ok(undefined);

  const root: TreeNode<
    Map<string, TreeNode<Map<string, TreeNode<Map<string, TreeNode>>>>>
  > = {
    totalSeconds: 0,
    tree: new Map(),
  };

  sessions.forEach((session) => {
    const duration = session.endSeconds - session.startSeconds;

    root.totalSeconds += duration;

    const clientKey = session.project.client || "";
    let clientNode = root.tree.get(clientKey);
    if (!clientNode) {
      clientNode = {
        totalSeconds: 0,
        tree: new Map(),
      };
      root.tree.set(clientKey, clientNode);
    }
    clientNode.totalSeconds += duration;

    const projectKey = session.project.name;
    let projectNode = clientNode.tree.get(projectKey);
    if (!projectNode) {
      projectNode = {
        totalSeconds: 0,
        tree: new Map(),
      };
      clientNode.tree.set(projectKey, projectNode);
    }
    projectNode.totalSeconds += duration;

    if (session.tags)
      session.tags.forEach((tag) => {
        if (options.tags && !options.tags.includes(tag)) return;

        let tagNode = projectNode!.tree.get(tag);
        if (!tagNode) {
          tagNode = { totalSeconds: 0, tree: undefined };
          projectNode!.tree.set(tag, tagNode);
        }
        tagNode.totalSeconds += duration;
      });
  });

  let text =
    `${style.date(dateToDayString(sessions[0].start))} -> ${style.date(
      dateToDayString(sessions[sessions.length - 1].end)
    )}` +
    EOL +
    EOL;

  const rows: TableRow[] = [];
  const emptyRow: TableRow = { label: "", value: "" };

  Array.from(root.tree.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(
      ([clientName, { totalSeconds: clientTotal, tree: clientTree }]) => {
        if (clientName) {
          rows.push({
            label: style.client(clientName),
            value: style.time(durationToString(clientTotal)),
          });
          rows.push(emptyRow);
        }

        Array.from(clientTree.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .forEach(
            ([
              projectName,
              { totalSeconds: projectTotal, tree: projectTree },
            ]) => {
              rows.push({
                label: style.project(projectName),
                value: style.time(durationToString(projectTotal)),
              });

              Array.from(projectTree.entries())
                .sort(([a], [b]) => a.localeCompare(b))
                .forEach(([tag, { totalSeconds: tagTotal }]) => {
                  rows.push({
                    label: style.tag(`#${tag}`),
                    value: style.light(durationToString(tagTotal)),
                  });
                });

              rows.push(emptyRow);
            }
          );

        rows.push(emptyRow);
      }
    );

  text +=
    columnify(rows, {
      showHeaders: false,
      columnSplitter: "  ",
    }) + EOL;

  text += `Total: ${style.time(durationToString(root.totalSeconds))}`;

  outputText(text);

  return Ok(undefined);
}

export function createReportCommand() {
  return wrapCommandWithFilterOptions(createCommand("report"))
    .description(`Display a summary of the recorded data`)
    .action(async (options: FilterOptions) => {
      const result = await displayReport(options);
      if (result.err) logError(result.val);
    });
}
