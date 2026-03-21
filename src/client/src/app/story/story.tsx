type Properties = Readonly<{
  title: string;
  body: string;
}>;

export const Story: React.FC<Properties> = properties => {
  return (
    <article>
      title: <div>{properties.title}</div>
      body: <div>{properties.body}</div>
    </article>
  );
};
