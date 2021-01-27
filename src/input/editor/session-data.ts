import { Result } from "ts-results";
import { join as pathJoin } from "path";
import { spawnSync } from "child_process";
import { Session } from "../../entities/session";
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

  const file = createFile<SessionDataInput>(filePath, isSessionDataInput);
  const unmodifiedInput: SessionDataInput = {
    project: session.project.name,
    start: dateToInputDefault(session.start),
    end: dateToInputDefault(session.end),
    tags: session.tags && session.tags.join(", "),
  };
  await file.store(unmodifiedInput, true);

  spawnSync(`vim ${filePath}`, [], { shell: true, stdio: "inherit" });

  const result = await file.load(true);
  file.delete();

  return result;
}
