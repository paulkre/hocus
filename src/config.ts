import { homedir as getHomeDir } from "os";
import { join } from "path";
import { readFileSync, existsSync } from "fs";
import { Ok, Err, Result } from "ts-results";
import { logError } from "./utils";
import isValidPath from "is-valid-path";
import * as style from "./style";

const homeDir = getHomeDir();

const configFilePath = join(homeDir, ".hocusrc");

type UserConfig = {
  appDirectory: string;
};

type Config = UserConfig & {
  dataDirectory: string;
};

const defaultConfig: UserConfig = {
  appDirectory: join(homeDir, ".hocus"),
};

function error(message: string) {
  logError(message);
  console.log("Using default configuration.");
  console.log();
}

function valueIsPartialConfig(value: any): value is Partial<UserConfig> {
  if ("dataDirectory" in value && typeof value.dataDirectory !== "string") {
    error(
      `Field ${style.bold("dataDirectory")} in config file ${style.bold(
        configFilePath
      )} is not of type ${style.bold("string")}.`
    );
    return false;
  }

  return true;
}

function sanitizePath(path: string): string {
  if (path[0] === "~") path = `${homeDir}${path.slice(1)}`;
  return path.replace(/[\/\\]+$/, "");
}

function sanitizeConfig({
  appDirectory,
}: UserConfig): Result<UserConfig, string> {
  appDirectory = sanitizePath(appDirectory);

  if (!isValidPath(appDirectory))
    return new Err(
      `Field ${style.bold("dataDirectory")} in config file ${style.bold(
        configFilePath
      )} does not contain a valid path.`
    );

  return new Ok({ appDirectory });
}

function loadOrCreateConfig(): UserConfig {
  if (existsSync(configFilePath)) {
    const data = readFileSync(configFilePath);

    try {
      const value = JSON.parse(data.toString());

      if (!valueIsPartialConfig(value)) return defaultConfig;

      const config: UserConfig = { ...defaultConfig, ...value };

      const result = sanitizeConfig(config);
      if (result.ok) return result.val;
      error(result.val);
    } catch {
      error(
        `Config file ${style.bold(configFilePath)} has an incorrect format.`
      );
    }
  }

  return defaultConfig;
}

const userConfig = loadOrCreateConfig();

export const config: Config = {
  ...userConfig,
  dataDirectory: join(userConfig.appDirectory, "data"),
};
