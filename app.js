import { readFileSync } from 'node:fs';
import { URL } from 'node:url';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import router from './src/router.js';

const app = express();
const swaggerDocument = JSON.parse(
  readFileSync(new URL('./swagger.json', import.meta.url), 'utf8'),
);

app.use(express.json());

app.get('/', (req, res) => {
  return res.status(200).json({ message: 'Server is running' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(router);


app.use((error, req, res, next) => {
  if (!res.headersSent && error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Malformed JSON' });
  }

  return next(error);
});


export default app;