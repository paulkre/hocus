import { Result, Ok } from "ts-results";
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
): Promise<Result<StateSession, string>> {
  const findResult = await findProject(data.project);

  return findResult.ok
    ? Ok({
        project: findResult.val || createProject({ name: data.project }),
        start: new Date(1000 * data.start),
      })
    : findResult;
}

async function createStateFromData(
  data: StateData
): Promise<Result<State, string>> {
  let currentSession: StateSession | undefined = undefined;

  if (data.currentSession) {
    const createResult = await createStateSessionFromData(data.currentSession);
    if (createResult.err) return createResult;
    currentSession = createResult.val;
  }

  return Ok({ currentSession });
}

const file = getFile<StateData>(
  pathJoin(config.appDirectory, "state.json"),
  (value): value is StateData => typeof value === "object",
  {}
);

export async function loadState(): Promise<Result<State, string>> {
  const loadResult = await file.load();
  return loadResult.ok ? createStateFromData(loadResult.val) : loadResult;
}

export function storeState(state: State) {
  return file.store(serializeState(state));
}
