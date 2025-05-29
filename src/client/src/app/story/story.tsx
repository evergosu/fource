type Properties = Readonly<{
  title: string;
}>;

export const Story: React.FC<Properties> = properties => {
  return <article>{properties.title}</article>;
};
