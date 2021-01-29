import { Ok, Err, Result } from "ts-results";
import { join as pathJoin } from "path";
import { promises as fs } from "fs";
import { spawnSync } from "child_process";
import { Session } from "../../entities/session";
import { config } from "../../config";
import {
  isSessionDataInput,
  SessionDataInput,
} from "../../parsing/session-data";
import { dateToInputDefault } from "../../utils";

const { readFile, writeFile, unlink } = fs;

async function readData(
  filePath: string
): Promise<Result<SessionDataInput, string>> {
  try {
    const data = await readFile(filePath);
    const input = JSON.parse(data.toString());
    if (!isSessionDataInput(input)) throw Error();
    return Ok(input);
  } catch {
    return Err("Edited file could not be read.");
  }
}

export async function requestSessionDataViaEditor(
  session: Session
): Promise<Result<SessionDataInput, string>> {
  const filePath = pathJoin(config.appDirectory, `edit-${session.id}.json`);

  const unmodifiedInput: SessionDataInput = {
    projectName: session.project.name,
    start: dateToInputDefault(session.start),
    end: dateToInputDefault(session.end),
    tags: session.tags && session.tags.join(", "),
  };
  await writeFile(filePath, JSON.stringify(unmodifiedInput));

  spawnSync(`vim ${filePath}`, [], { shell: true, stdio: "inherit" });

  const readResult = await readData(filePath);

  await unlink(filePath);

  return readResult;
}
