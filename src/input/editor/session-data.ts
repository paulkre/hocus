import { Ok, Result } from "ts-results";
import { Session } from "../../entities/session";
import { SessionDataInput } from "../../parsing/session-data";
import { dateToInputDefault } from "../../utils";
import { requestEditViaEditor } from "./editor";

type YamlInput = {
  Project: string;
  "Start-Date": string;
  "End-Date": string;
  Tags?: string | string[];
};

function isYamlInput(value: any): value is YamlInput {
  return (
    typeof value === "object" &&
    typeof value["Start-Date"] === "string" &&
    typeof value["End-Date"] === "string" &&
    (typeof value.Tags === "string" ||
      (Array.isArray(value.Tags) &&
        value.Tags.every((tag: any) => typeof tag === "string")))
  );
}

export async function requestSessionDataViaEditor(
  session: Session
): Promise<Result<SessionDataInput, string>> {
  const baseInput: YamlInput = {
    Project: session.project.name,
    "Start-Date": dateToInputDefault(session.start),
    "End-Date": dateToInputDefault(session.end),
    Tags: session.tags || [],
  };

  const inputResult = await requestEditViaEditor<YamlInput>(
    session.id,
    baseInput,
    isYamlInput
  );
  if (inputResult.err) return inputResult;
  const input = inputResult.val;

  return Ok({
    projectName: input.Project,
    start: input["Start-Date"],
    end: input["End-Date"],
    tags: input.Tags,
  });
}
