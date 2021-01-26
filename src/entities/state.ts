export type StateSession = {
  project: string;
  start: Date;
  tags?: string[];
};

export type State = {
  currentSession?: StateSession;
};
