import { Ok, Err, Result } from "ts-results";
import { requestEditViaEditor } from "./editor";
import { stringify, parse } from "yaml";

export async function requestYamlEditViaEditor<T>(
  fileID: string,
  baseInput: T,
  isType: (value: any) => value is T
): Promise<Result<T, string>> {
  const data = await requestEditViaEditor(
    `edit-${fileID}.yml`,
    stringify(baseInput)
  );
  const input = parse(data.toString());
  return isType(input) ? Ok(input) : Err("File was not edited correctly.");
}
