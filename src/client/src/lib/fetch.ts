export const relativeFetch = (path: string, options?: RequestInit) => {
  return fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${path}`, options);
};
