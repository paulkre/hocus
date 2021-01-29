export type ProjectProps = {
  name: string;
  client?: string;
};

export type Project = ProjectProps & {
  modify(changes: Partial<Omit<ProjectProps, "name">>): Project;
  serialize(): ProjectProps;
};

export function createProject(props: ProjectProps): Project {
  return {
    ...props,
    modify: (changes) =>
      createProject({
        ...props,
        ...changes,
      }),
    serialize: () => ({ ...props }),
  };
}
