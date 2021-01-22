import { createFile } from "./file";

type State = {
  project: string;
  start: number;
  tags?: string[];
};

const file = createFile<State>("state.json");

export const loadState = file.load;
export const storeState = file.store;
export const clearState = file.delete;
