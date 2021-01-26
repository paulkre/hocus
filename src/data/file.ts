import { dirname } from "path";
import { existsSync, unlinkSync, renameSync, promises as fs } from "fs";
import mkdirp from "mkdirp";
import { logError } from "../utils";
import chalk from "chalk";

const { readFile, writeFile } = fs;

export type File<T> = {
  load(): Promise<T | null>;
  store(value: T, pretty?: boolean): Promise<void>;
  delete(): void;
};

export function createFile<T>(
  path: string,
  isType: (value: any) => value is T
): File<T> {
  const directory = dirname(path);

  return {
    async load() {
      if (existsSync(path)) {
        const data = await readFile(path);
        try {
          const content = JSON.parse(data.toString());
          if (!isType(content)) throw Error();
          return content;
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

    store(value, pretty) {
      if (!existsSync(directory)) mkdirp.sync(directory);
      return writeFile(path, JSON.stringify(value, null, pretty ? 1 : 0));
    },

    delete() {
      unlinkSync(path);
    },
  };
}
