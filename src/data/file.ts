import { Result, Ok, Err } from "ts-results";
import { dirname } from "path";
import { existsSync, unlinkSync, copyFileSync, promises as fs } from "fs";
import mkdirp from "mkdirp";
import { bold } from "../style";

const { readFile, writeFile } = fs;

export type File<T> = {
  load(): Promise<Result<T, string>>;
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
      if (!existsSync(path)) return Err(`File ${bold(path)} does not exist.`);

      const data = await readFile(path);
      try {
        const content = JSON.parse(data.toString());
        if (!isType(content)) throw Error();
        return Ok(content);
      } catch {
        const backupPath = `${path}.bak`;
        copyFileSync(path, backupPath);
        return Err(`File ${bold(path)} seems to be corrupted
The corrupted file was copied to ${bold(
          backupPath
        )} (in case you want to try to recover it)`);
      }
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
