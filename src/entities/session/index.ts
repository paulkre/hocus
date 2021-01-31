import { customAlphabet } from "nanoid";
import { Project } from "../project";
import { dateToID } from "./date";

export { dateIDToDate } from "./date";

export type SessionProps = {
  project: Project;
  start: Date;
  end: Date;
  tags?: string[];
  notes?: string;
  localID?: string;
};

export type Session = SessionProps & {
  id: string;
  localID: string;
  dateID: string;
  startSeconds: number;
  endSeconds: number;
  isIdenticalTo(other: Session): boolean;
  mutate(changes: Partial<Omit<SessionProps, "localID">>): Session;
};

const createRandomID = customAlphabet(
  "0123456789abcdefghijklmnopqrstuvwxyz",
  5
);

export function createSession(props: SessionProps): Session {
  const dateID = dateToID(props.start);
  const localID = props.localID || createRandomID();
  const id = `${dateID}${localID}`;

  const startSeconds = Math.floor(props.start.getTime() / 1000);
  const endSeconds = Math.floor(props.end.getTime() / 1000);

  return {
    ...props,
    id,
    localID,
    dateID,
    startSeconds,
    endSeconds,
    isIdenticalTo(other) {
      const tagsA = props.tags;
      const tagsB = other.tags;
      return (
        id === other.id &&
        props.project.name === other.project.name &&
        startSeconds === other.startSeconds &&
        endSeconds === other.endSeconds &&
        ((!tagsA && !tagsB) ||
          (!!tagsA &&
            !!tagsB &&
            tagsA.length === tagsB.length &&
            tagsA.every((tag, i) => tag === tagsB[i])))
      );
    },
    mutate: (changes) =>
      createSession({
        ...props,
        ...changes,
        localID,
      }),
  };
}
