import { join as pathJoin } from "path";
import { config } from "../config";
import { getFile } from "./file";
import { State, StateSession } from "../entities/state";
import { findProject } from "./projects";
import { createProject } from "../entities/project";

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
    project: props.project.name,
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

async function createStateSessionFromData(
  data: StateSessionData
): Promise<StateSession> {
  return {
    project:
      (await findProject(data.project)) ||
      createProject({ name: data.project }),
    start: new Date(1000 * data.start),
  };
}

async function createStateFromData(data: StateData): Promise<State> {
  return {
    currentSession: data.currentSession
      ? await createStateSessionFromData(data.currentSession)
      : undefined,
  };
}

const file = getFile<StateData>(
  pathJoin(config.appDirectory, "state.json"),
  (value): value is StateData => typeof value === "object",
  {}
);

export async function loadState(): Promise<State> {
  const data = (await file.load()).unwrapOr<StateData>({});
  return createStateFromData(data);
}

export function storeState(state: State) {
  return file.store(serializeState(state));
}
