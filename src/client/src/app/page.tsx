import { relativeFetch } from 'src/lib/fetch';

export default async function Home() {
  const data = await relativeFetch('/api/story');

  const story: string = (await data.json()) as string;

  return <main>{story}</main>;
}
