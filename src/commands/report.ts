import { Result, Ok } from "ts-results";
import { format } from "date-and-time";
import { createCommand } from "../command";
import { dateToDayString, durationToString, logError } from "../utils";
import { wrapCommandWithFilterOptions, FilterOptions } from "../input/fliter";
import { resolveFilter } from "../resolve/filter";
import * as style from "../style";

type TreeNode<T = undefined> = { totalSeconds: number; tree: T };

const createLabel = (name: string, totalSeconds: number) =>
  `${name} - ${style.time(durationToString(totalSeconds))}`;

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

  console.log(
    `${style.date(dateToDayString(sessions[0].start))} -> ${style.date(
      dateToDayString(sessions[sessions.length - 1].end)
    )}`
  );
  console.log();

  Array.from(root.tree.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(
      ([clientName, { totalSeconds: clientTotal, tree: clientTree }]) => {
        if (clientName) {
          console.log(createLabel(style.client(clientName), clientTotal));
          console.log();
        }

        Array.from(clientTree.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .forEach(
            ([
              projectName,
              { totalSeconds: projectTotal, tree: projectTree },
            ]) => {
              console.log(
                createLabel(
                  `${clientName ? "  " : ""}${style.project(projectName)}`,
                  projectTotal
                )
              );

              Array.from(projectTree.entries())
                .sort(([a], [b]) => a.localeCompare(b))
                .forEach(([tag, { totalSeconds: tagTotal }]) => {
                  console.log(
                    createLabel(
                      `${clientName ? "  " : ""}  ${style.tag(`#${tag}`)}`,
                      tagTotal
                    )
                  );
                });

              console.log();
            }
          );

        console.log();
      }
    );

  console.log(`Total: ${style.time(durationToString(root.totalSeconds))}`);

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
