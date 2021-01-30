import columnify from "columnify";

export type ChangeMap = Map<string, [string | undefined, string | undefined]>;

const noValueLabel = "<none>";

export function displayChanges(changes: ChangeMap) {
  console.log(
    columnify(
      Array.from(changes.entries()).map(([name, [before, after]]) => ({
        name: `${name}:`,
        before: before || noValueLabel,
        arrow: "=>",
        after: after || noValueLabel,
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
}
