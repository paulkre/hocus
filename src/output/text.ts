import { EOL } from "os";
import { spawnSync } from "child_process";

export function outputText(text: string) {
  if (text.split(EOL).length < 10) console.log(text);
  else
    spawnSync(`echo "${text}" | less -R`, [], {
      shell: true,
      stdio: "inherit",
    });
}
