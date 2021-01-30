export type ProjectProps = {
  name: string;
  client?: string;
};

export type Project = ProjectProps & {
  mutate(changes: Partial<ProjectProps>): Project;
  serialize(): ProjectProps;
};

export function createProject(props: ProjectProps): Project {
  return {
    ...props,
    mutate: (changes) =>
      createProject({
        ...props,
        ...changes,
      }),
    serialize: () => ({ ...props }),
  };
}
