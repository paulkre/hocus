import { Ok, Err, Result } from "ts-results";
import { join as pathJoin } from "path";
import { promises as fs } from "fs";
import { spawnSync } from "child_process";
import { stringify, parse } from "yaml";
import { config } from "../../config";

const { readFile, writeFile, unlink } = fs;

export async function requestEditViaEditor<T>(
  fileID: string,
  baseInput: T,
  isType: (value: any) => value is T
): Promise<Result<T, string>> {
  const filePath = pathJoin(config.appDirectory, `edit-${fileID}.yml`);

  await writeFile(filePath, stringify(baseInput));

  spawnSync(`vim ${filePath}`, [], { shell: true, stdio: "inherit" });

  const data = await readFile(filePath);
  await unlink(filePath);

  const input = parse(data.toString());
  return isType(input)
    ? Ok(input)
    : Err("Edited file has an incorrect format.");
}
