import { existsSync, readdirSync } from "fs";
import mkdirp from "mkdirp";
import { config } from "../../../config";

export function getFilenames() {
  if (!existsSync(config.dataDirectory)) mkdirp.sync(config.dataDirectory);

  return readdirSync(config.dataDirectory, {
    withFileTypes: true,
  })
    .filter(
      (dirent) => dirent.isFile() && dirent.name.match(/^\d\d\d\d-\d\d\.json$/)
    )
    .map((dirent) => dirent.name)
    .sort((a, b) => a.localeCompare(b));
}
