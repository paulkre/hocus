import { Project } from "./project";

export type StateSession = {
  project: Project;
  start: Date;
  tags?: string[];
  notes?: string;
};

export type State = {
  currentSession?: StateSession;
};
