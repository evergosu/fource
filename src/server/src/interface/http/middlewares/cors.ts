import cors from 'cors';
/**
 * Prepares cors middleware with provided white list.
 * @param allowList - white list to allow connections.
 * @returns configured CORS middleware.
 */
export function allowCorsFor(allowList: string[]) {
  return cors({
    origin(requestOrigin, callback) {
      if (!requestOrigin || allowList.includes(requestOrigin) || process.env.NODE_ENV === 'test') {
        // eslint-disable-next-line unicorn/no-null
        callback(null, true);
      } else if (requestOrigin) {
        callback(new Error(`${requestOrigin} not allowed by CORS.`));
      }
    },
    credentials: true,
  });
}
