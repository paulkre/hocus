export type Session = {
  id: string;
  start: Date;
  end: Date;
  project: string;
  tags?: string[];
  totalSeconds: number;
};

export type SessionData = {
  localID: string;
  start: number;
  end: number;
  project: string;
  tags?: string[];
};

function dateToString(date: Date) {
  const monthNum = 12 * (date.getFullYear() - 1900) + date.getMonth();
  return monthNum.toString(36).toUpperCase();
}

export function createSession({
  localID,
  project,
  start: startSeconds,
  end: endSeconds,
  tags,
}: SessionData): Session {
  const start = new Date(1000 * startSeconds);

  return {
    id: `${localID}-${dateToString(start)}`,
    project,
    start,
    end: new Date(1000 * endSeconds),
    tags,
    totalSeconds: endSeconds - startSeconds,
  };
}
