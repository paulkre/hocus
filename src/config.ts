import { homedir as getHomeDir } from "os";
import { join } from "path";
import { readFileSync, existsSync } from "fs";
import { Ok, Err, Result } from "ts-results";
import { logError } from "./utils";
import chalk from "chalk";
import isValidPath from "is-valid-path";

const homeDir = getHomeDir();

const configFilePath = join(homeDir, ".hocusrc");

type Config = {
  dataDirectory: string;
};

const defaultConfig: Config = {
  dataDirectory: join(homeDir, ".hocus"),
};

function error(message: string) {
  logError(message);
  console.log("Using default configuration");
  console.log();
}

function valueIsPartialConfig(value: any): value is Partial<Config> {
  if ("dataDirectory" in value && typeof value.dataDirectory !== "string") {
    error(
      `Field ${chalk.bold("dataDirectory")} in config file ${chalk.bold(
        configFilePath
      )} is not of type ${chalk.bold("string")}`
    );
    return false;
  }

  return true;
}

function sanitizePath(path: string): string {
  if (path[0] === "~") path = `${homeDir}${path.slice(1)}`;
  return path.replace(/[\/\\]+$/, "");
}

function sanitizeConfig({ dataDirectory }: Config): Result<Config, string> {
  dataDirectory = sanitizePath(dataDirectory);

  if (!isValidPath(dataDirectory))
    return new Err(
      `Field ${chalk.bold("dataDirectory")} in config file ${chalk.bold(
        configFilePath
      )} does not contain a valid path`
    );

  return new Ok({ dataDirectory });
}

function getOrCreateConfig(): Config {
  if (existsSync(configFilePath)) {
    const data = readFileSync(configFilePath);

    try {
      const value = JSON.parse(data.toString());

      if (!valueIsPartialConfig(value)) return defaultConfig;

      const config: Config = { ...defaultConfig, ...value };

      const result = sanitizeConfig(config);
      if (result.ok) return result.val;
      error(result.val);
    } catch {
      error(
        `Config file ${chalk.bold(configFilePath)} has an incorrect format`
      );
    }
  }

  return defaultConfig;
}

export const config = getOrCreateConfig();
