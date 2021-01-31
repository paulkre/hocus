import { Ok, Result } from "ts-results";
import { Project } from "../../entities/project";
import { ProjectInput } from "../../parsing/project";
import { requestYamlEditViaEditor } from "./yaml";

type YamlInput = {
  Name: string;
  Client?: string;
};

function isYamlInput(value: any): value is YamlInput {
  return (
    typeof value === "object" &&
    typeof value.Name === "string" &&
    (!value.Client || typeof value.Client === "string")
  );
}

export async function editProjectViaEditor(
  project: Project
): Promise<Result<ProjectInput, string>> {
  const baseInput: YamlInput = {
    Name: project.name,
    Client: project.client || "",
  };

  const inputResult = await requestYamlEditViaEditor<YamlInput>(
    project.name,
    baseInput,
    isYamlInput
  );
  if (inputResult.err) return inputResult;
  const input = inputResult.val;

  return Ok({
    name: input.Name,
    client: input.Client,
  });
}
