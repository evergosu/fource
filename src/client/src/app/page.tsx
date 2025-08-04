import { relativeFetch } from 'client/library/fetch';

import { Story } from './story/story';

export default async function Home() {
  let title: string;

  try {
    const response = await relativeFetch('/api/story');

    if (response.ok) {
      const story = (await response.json()) as { title: string };

      title = story.title;
    } else {
      const error = (await response.json()) as { message: string };

      title = error.message;
    }
  } catch (error: unknown) {
    title = String(error);
  }

  return (
    <main>
      <Story title={title} />
    </main>
  );
}

export const dynamic = 'force-dynamic';
