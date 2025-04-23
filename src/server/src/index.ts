import express, { type Response, type Request } from 'express';
import { getEnvironment } from 'config/environment';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';

const server = express();
server.disable('x-powered-by');

function getStory(_request: Request, response: Response) {
  response.status(200).json('the story');
}

// eslint-disable-next-line sonarjs/new-cap
const storyRouter = express.Router().get('/story', getStory);

const environment = getEnvironment();

server
  .set('trust proxy', 1)
  .use(
    cors({
      origin(requestOrigin, callback) {
        if (
          !requestOrigin ||
          requestOrigin === environment.server.url.origin ||
          requestOrigin === environment.client.url.origin
        ) {
          // eslint-disable-next-line unicorn/no-null
          callback(null, true);
        } else if (requestOrigin) {
          callback(new Error(`${requestOrigin} not allowed by CORS`));
        }
      },
      // credentials: true,
    }),
  )
  .use(helmet())
  .use(morgan('dev'))
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  .use('/api', storyRouter)
  .listen(environment.server.url.port, () => {
    process.stdout.write(
      `\nServer running at: ${environment.server.url.origin}\n`,
    );
  });
