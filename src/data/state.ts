import { join as pathJoin } from "path";
import { config } from "../config";
import { createFile } from "./file";
import { SessionData } from "./session";

type RunningSession = Omit<SessionData, "localID" | "end">;
type State = {
  currentSession?: RunningSession | null;
};

const file = createFile<State>(pathJoin(config.appDirectory, "state.json"));

export async function loadCurrentSession(): Promise<RunningSession | null> {
  const state = await file.load();
  if (!state) return null;
  return state.currentSession ? state.currentSession : null;
}

export async function clearCurrentSession() {
  const state: State = (await file.load()) || {};
  file.store({ ...state, currentSession: null });
}

export async function storeCurrentSession(currentSession: RunningSession) {
  const state: State = (await file.load()) || {};
  file.store({ ...state, currentSession });
}
