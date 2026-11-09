import { writeFileSync } from 'node:fs';
import { URL } from 'node:url';
import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDocument = swaggerJsdoc({
  failOnErrors: true,
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Books API',
      version: '1.0.0',
    },
    servers: [{ url: '/' }],
  },
  apis: ['./src/router.js'],
});

writeFileSync(
  new URL('../swagger.json', import.meta.url),
  `${JSON.stringify(swaggerDocument, null, 2)}\n`,
);