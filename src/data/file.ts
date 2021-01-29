import { Result, Ok, Err } from "ts-results";
import { dirname } from "path";
import { existsSync, unlinkSync, copyFileSync, promises as fs } from "fs";
import mkdirp from "mkdirp";
import { bold } from "../style";

const { readFile, writeFile } = fs;

export type File<T> = {
  load(ignoreCache?: boolean): Promise<Result<T, string>>;
  store(value: T, pretty?: boolean): Promise<void>;
  delete(): void;
};

function createFile<T>(
  path: string,
  isType: (value: any) => value is T
): File<T> {
  const directory = dirname(path);
  let dataCache: T | null = null;

  return {
    async load(ignoreCache) {
      if (dataCache && !ignoreCache) return Ok(dataCache);
      if (!existsSync(path)) return Err(`File ${bold(path)} does not exist.`);

      const rawData = await readFile(path);
      try {
        const data = JSON.parse(rawData.toString());
        if (!isType(data)) throw Error();
        dataCache = data;
        return Ok(data);
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
      dataCache = value;
      return writeFile(path, JSON.stringify(value, null, pretty ? 1 : 0));
    },

    delete() {
      dataCache = null;
      unlinkSync(path);
    },
  };
}

const fileCache = new Map<string, File<any>>();
export function getFile<T>(
  path: string,
  isType: (value: any) => value is T
): File<T> {
  const cachedFile = fileCache.get(path);
  if (cachedFile) return cachedFile;
  const file = createFile<T>(path, isType);
  fileCache.set(path, file);
  return file;
}
