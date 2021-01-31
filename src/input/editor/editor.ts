import { join as pathJoin } from "path";
import { promises as fs } from "fs";
import { spawnSync } from "child_process";
import { config } from "../../config";

const { readFile, writeFile, unlink } = fs;

export async function requestEditViaEditor(
  filename: string,
  baseInput: string
): Promise<string> {
  const filePath = pathJoin(config.appDirectory, filename);

  await writeFile(filePath, baseInput);

  spawnSync(`vim ${filePath}`, [], { shell: true, stdio: "inherit" });

  const data = await readFile(filePath);
  await unlink(filePath);

  return data.toString();
}
