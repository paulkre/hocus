export const SESSION_MAX_DURATION = 2_419_200; // in seconds

export type SessionData = {
  localID: string;
  start: number;
  end: number;
  project: string;
  tags?: string[];
};

export type Session = {
  id: string;
  dateID: string;
  start: Date;
  end: Date;
  project: string;
  tags: string[];
  totalSeconds: number;
  data: SessionData;
};

export type SessionBlueprint = Omit<SessionData, "localID">;

export * from "./store";
export * from "./load";
export * from "./creation";

export function sessionsAreEqual(a: Session, b: Session): boolean {
  return (
    a.id === b.id &&
    a.project === b.project &&
    a.data.start === b.data.start &&
    a.data.end === b.data.end &&
    a.tags.length === b.tags.length &&
    a.tags.every((tag, i) => tag === b.tags[i])
  );
}
