import { relativeFetch } from 'client/library/fetch';

import { Story } from './story/story';

interface Payload {
  title: string;
  body: string;
}

export default async function Home() {
  try {
    const response = await relativeFetch('/api/stories/');

    if (response.ok) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const stories: Payload[] = await response.json();

      if (stories.length === 0) {
        return <main>There is no stories</main>;
      }

      const [story] = stories;

      return (
        <main>
          <Story title={story?.title ?? ''} body={story?.body ?? ''} />
        </main>
      );
    } else {
      return <main>There is no stories</main>;
    }
  } catch (error: unknown) {
    return <main>{JSON.stringify(error)}</main>;
  }
}

export const dynamic = 'force-dynamic';
