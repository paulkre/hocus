import { Session } from "./session";
import { loadSessions } from "../data/session";

export type ProjectProps = {
  name: string;
  count: number;
};

export type Project = {
  data: ProjectProps;
  getSessions(): Promise<Session[]>;
  modify(changes: Partial<Omit<ProjectProps, "name">>): Project;
};

export function isProjectData(value: any): value is ProjectProps {
  return (
    typeof value === "object" &&
    typeof value.name === "string" &&
    typeof value.count === "number"
  );
}

export function createProject(props: ProjectProps): Project {
  let sessions: Session[] | null = null;

  return {
    data: props,
    async getSessions() {
      if (!sessions) sessions = await loadSessions({ project: props.name });
      return sessions;
    },
    modify: (changes) =>
      createProject({
        ...props,
        ...changes,
      }),
  };
}
