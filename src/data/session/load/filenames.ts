import { readdirSync } from "fs";
import { config } from "../../../config";

export function getFilenames() {
  return readdirSync(config.dataDirectory, {
    withFileTypes: true,
  })
    .filter(
      (dirent) => dirent.isFile() && dirent.name.match(/^\d\d\d\d-\d\d\.json$/)
    )
    .map((dirent) => dirent.name)
    .sort((a, b) => a.localeCompare(b));
}
