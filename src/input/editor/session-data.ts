import { Result, Ok, Err } from "ts-results";
import { join as pathJoin } from "path";
import { spawnSync } from "child_process";
import { Session } from "../../data/session";
import { createFile } from "../../data/file";
import { config } from "../../config";
import {
  isSessionDataInput,
  SessionDataInput,
} from "../../parsing/session-data";
import { dateToInputDefault } from "../../utils";

export async function requestSessionDataViaEditor(
  session: Session
): Promise<Result<SessionDataInput, string>> {
  const filePath = pathJoin(config.appDirectory, `edit-${session.id}.json`);

  const file = createFile(filePath);
  const unmodifiedInput: SessionDataInput = {
    project: session.project,
    start: dateToInputDefault(session.start),
    end: dateToInputDefault(session.end),
    tags: session.tags.join(", "),
  };
  file.store(unmodifiedInput, true);

  spawnSync(`vim ${filePath}`, [], { shell: true, stdio: "inherit" });

  const modifiedData = await file.load();
  file.delete();

  return isSessionDataInput(modifiedData)
    ? Ok(modifiedData)
    : Err("Input format is invalid.");
}
