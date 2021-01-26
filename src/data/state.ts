import { join as pathJoin } from "path";
import { config } from "../config";
import { createFile } from "./file";
import { State, StateSession } from "../entities/state";

type StateSessionData = {
  project: string;
  start: number;
  tags?: string[];
};

type StateData = {
  currentSession?: StateSessionData;
};

function serializeSessionState(props: StateSession): StateSessionData {
  return {
    ...props,
    start: Math.floor(props.start.getTime() / 1000),
  };
}

function serializeState(state: State): StateData {
  return {
    ...state,
    currentSession:
      state.currentSession && serializeSessionState(state.currentSession),
  };
}

function createStateSessionFromData(data: StateSessionData): StateSession {
  return {
    project: data.project,
    start: new Date(1000 * data.start),
  };
}

function createStateFromData(data: StateData): State {
  return {
    currentSession:
      data.currentSession && createStateSessionFromData(data.currentSession),
  };
}

const file = createFile<StateData>(
  pathJoin(config.appDirectory, "state.json"),
  (value): value is StateData => typeof value === "object"
);

export async function loadState(): Promise<State> {
  const data = await file.load();
  return data ? createStateFromData(data) : {};
}

export function storeState(state: State) {
  return file.store(serializeState(state));
}
