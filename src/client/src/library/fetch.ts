import { headers } from 'next/headers';

export async function relativeFetch(path: string, options?: RequestInit) {
  const origin = await getOrigin();

  return fetch(`${origin}${path}`, {
    ...options,
    cache: 'no-store',
  });
}

async function getOrigin() {
  const h = await headers();

  const protocol = h.get('x-forwarded-proto') ?? 'http';

  const host = h.get('host');

  if (!host) {
    throw new Error('Host header missing');
  }

  return `${protocol}://${host}`;
}
