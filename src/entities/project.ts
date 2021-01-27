export type ProjectProps = {
  name: string;
  count: number;
  client?: string;
};

export type Project = ProjectProps & {
  modify(changes: Partial<Omit<ProjectProps, "name">>): Project;
};

export function createProject(props: ProjectProps): Project {
  return {
    ...props,
    modify: (changes) =>
      createProject({
        ...props,
        ...changes,
      }),
  };
}
