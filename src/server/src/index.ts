import express, { type Response, type Request } from 'express';
import { log } from 'node:console';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';

const server = express();
server.disable('x-powered-by');

const PORT = '3333';
const ORIGIN = 'localhost';

function getStory(_request: Request, response: Response) {
  const payload = {
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam sit amet \
        imperdiet dolor. Vestibulum ante ipsum primis in faucibus orci luctus et \
        ultrices posuere cubilia curae; Fusce elit sapien, imperdiet sit amet \
        mauris in, rutrum rhoncus turpis. Proin a nulla hendrerit, rutrum neque \
        quis, elementum risus. Sed ex sem, fringilla id luctus non, maximus in \
        augue. Vestibulum tempus, lorem sed posuere suscipit, lectus elit \
        blandit felis, dignissim euismod tortor justo ac velit. Sed et ex \
        tellus. Praesent consectetur leo non urna vulputate elementum. Vivamus \
        velit justo, dignissim at ullamcorper quis, aliquam vitae metus. Nam \
        faucibus nisi non nibh gravida, ut viverra ante ullamcorper. Donec \
        commodo ultricies tortor, bibendum semper nibh ultrices hendrerit. In \
        bibendum, ex et consectetur dictum, turpis justo dictum purus, sed \
        aliquam ex nulla quis dui. Aenean varius, odio non porta molestie, nulla \
        odio dictum nulla, sed consectetur tortor ligula nec justo. Ut venenatis \
        eleifend sapien in finibus. Class aptent taciti sociosqu ad litora \
        torquent per conubia nostra, per inceptos himenaeos. Fusce tincidunt \
        libero commodo eros volutpat tempor nec vel lorem. Quisque erat ante, \
        condimentum efficitur pharetra et, dictum a mauris. Nullam sed sem \
        hendrerit augue interdum ullamcorper sed id magna. Cras ut nisi eget dui \
        faucibus iaculis et eu arcu. Cras dapibus vulputate est eu ultricies. \
        Donec eu tristique velit, id tempus ligula. Fusce nisl dolor, elementum \
        et consequat a, dictum imperdiet turpis. Pellentesque a ultricies elit, \
        quis dapibus odio. Pellentesque dui risus, sollicitudin in felis quis, \
        cursus aliquet magna. Suspendisse consequat lacus dui, ut accumsan ex \
        viverra nec. Cras mattis eros sed enim rhoncus tincidunt. Sed ac \
        tristique leo, non finibus diam. Sed sapien nisl, elementum sed \
        venenatis eu, suscipit sed magna. Duis consectetur sem at augue \
        fermentum, eget sollicitudin ipsum ultricies. Vivamus semper, tellus nec \
        suscipit feugiat, sem eros viverra sapien, non mattis orci metus vel \
        sapien. Morbi a dui et eros sagittis efficitur et ac tortor. Class \
        aptent taciti sociosqu ad litora torquent per conubia nostra, per \
        inceptos himenaeos. Nulla in bibendum risus. Curabitur arcu nulla, \
        aliquet nec iaculis et, convallis eget eros. Praesent erat enim, rutrum \
        a congue eget, lobortis non urna. Mauris nisl eros, bibendum non enim \
        non, egestas maximus velit. Quisque quis euismod eros. Vivamus tincidunt \
        purus a porta rutrum. Sed lectus urna, aliquet in leo ut, molestie \
        feugiat eros. Nam et justo rutrum, congue lacus ut, placerat sapien. \
        Vestibulum tempor eros condimentum quam malesuada congue. Phasellus \
        laoreet mi quam, ac convallis ante vestibulum quis. Vestibulum nec diam \
        sed ante vestibulum scelerisque id at elit. Curabitur dui tellus, \
        suscipit sit amet augue vitae, maximus rutrum leo. Sed dui lectus, \
        rhoncus ac justo vitae, blandit finibus urna.',
    title: 'The Story',
  };

  response.status(200).json(payload);
}

// eslint-disable-next-line sonarjs/new-cap
const storyRouter = express.Router().get('/story', getStory);

server
  .set('trust proxy', 1)
  .use(
    cors({
      origin(requestOrigin, callback) {
        log(requestOrigin);
        if (
          !requestOrigin ||
          requestOrigin === ORIGIN ||
          requestOrigin === `https://localhost:${PORT}` ||
          requestOrigin === `https://localhost:3000`
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
  .listen(PORT, () => {
    process.stdout.write(`\nserver running at port *${PORT}*\n`);
  });
