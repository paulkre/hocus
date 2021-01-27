import { Project } from "./project";

export type StateSession = {
  project: Project;
  start: Date;
  tags?: string[];
};

export type State = {
  currentSession?: StateSession;
};
