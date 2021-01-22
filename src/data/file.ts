import { join as pathJoin } from "path";
import {
  existsSync,
  readFile as nodeReadFile,
  writeFileSync,
  unlinkSync,
  createWriteStream,
  renameSync,
} from "fs";
import mkdirp from "mkdirp";
import { config } from "../config";
import { logError } from "../utils";
import chalk from "chalk";

async function readFile(filePath: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    nodeReadFile(filePath, null, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

export function createFile<T>(fileName: string) {
  const filePath = pathJoin(config.dataDirectory, fileName);

  return {
    filePath,
    async load(): Promise<T | null> {
      if (existsSync(filePath)) {
        const data = await readFile(filePath);
        try {
          return JSON.parse(data.toString()) as T;
        } catch {
          logError(`File ${chalk.bold(filePath)} seems to be corrupted`);
          const backupPath = `${filePath}.bak`;
          renameSync(filePath, backupPath);
          console.log(
            `The corrupted file was moved to ${chalk.bold(
              backupPath
            )} (in case you want to try to recover it)`
          );
          console.log();
        }
      }

      return null;
    },
    store(value: T, pretty?: boolean) {
      if (!existsSync(config.dataDirectory)) mkdirp.sync(config.dataDirectory);
      writeFileSync(filePath, JSON.stringify(value, null, pretty ? 1 : 0));
    },
    storeArray() {},
    delete() {
      unlinkSync(filePath);
    },
  };
}
