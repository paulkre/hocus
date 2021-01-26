import { dirname } from "path";
import {
  existsSync,
  readFile as nodeReadFile,
  writeFileSync,
  unlinkSync,
  renameSync,
} from "fs";
import mkdirp from "mkdirp";
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

export function createFile(path: string) {
  const directory = dirname(path);

  return {
    async load(): Promise<any | null> {
      if (existsSync(path)) {
        const data = await readFile(path);
        try {
          return JSON.parse(data.toString());
        } catch {
          logError(`File ${chalk.bold(path)} seems to be corrupted`);
          const backupPath = `${path}.bak`;
          renameSync(path, backupPath);
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
    store(value: any, pretty?: boolean) {
      if (!existsSync(directory)) mkdirp.sync(directory);
      writeFileSync(path, JSON.stringify(value, null, pretty ? 1 : 0));
    },
    storeArray() {},
    delete() {
      unlinkSync(path);
    },
  };
}
