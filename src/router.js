import express from 'express';

import {
  getBooksHandler,
  getBookByIdHandler
} from './controllers/books.js';

import {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} from './controllers/authors.js';

const router = express.Router();

router.get('/books', getBooksHandler);

router.get('/books/:id', getBookByIdHandler);

/**
 * @openapi
 * components:
 *   schemas:
 *     Author:
 *       type: object
 *       required: [id, name, birthYear]
 *       additionalProperties: false
 *       properties:
 *         id: { type: string, example: a4 }
 *         name: { type: string, example: Example Author }
 *         birthYear: { type: integer, minimum: 1, example: 1980 }
 *     AuthorUpdate:
 *       type: object
 *       required: [name, birthYear]
 *       additionalProperties: false
 *       properties:
 *         name: { type: string, example: Updated Author }
 *         birthYear: { type: integer, minimum: 1, example: 1981 }
 *     AuthorError:
 *       type: object
 *       required: [message]
 *       properties:
 *         message: { type: string }
 *   responses:
 *     AuthorRecord:
 *       description: The author record
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Author' }
 *     AuthorBadRequest:
 *       description: Invalid author data or duplicate author ID
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/AuthorError' }
 *     AuthorNotFound:
 *       description: Author not found
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/AuthorError' }
 *     AuthorServerError:
 *       description: Internal server error
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/AuthorError' }
 * /authors:
 *   get:
 *     summary: Get all authors
 *     tags: [Authors]
 *     responses:
 *       '200':
 *         description: A list of authors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Author' }
 *       '500': { $ref: '#/components/responses/AuthorServerError' }
 *   post:
 *     summary: Create an author
 *     tags: [Authors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Author' }
 *           example: { id: a4, name: Example Author, birthYear: 1980 }
 *     responses:
 *       '201': { $ref: '#/components/responses/AuthorRecord' }
 *       '400': { $ref: '#/components/responses/AuthorBadRequest' }
 *       '500': { $ref: '#/components/responses/AuthorServerError' }
 * /authors/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       description: The custom author ID
 *       schema: { type: string }
 *   get:
 *     summary: Get an author by ID
 *     tags: [Authors]
 *     responses:
 *       '200': { $ref: '#/components/responses/AuthorRecord' }
 *       '404': { $ref: '#/components/responses/AuthorNotFound' }
 *       '500': { $ref: '#/components/responses/AuthorServerError' }
 *   put:
 *     summary: Update an author by ID
 *     tags: [Authors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/AuthorUpdate' }
 *           example: { name: Updated Author, birthYear: 1981 }
 *     responses:
 *       '200': { $ref: '#/components/responses/AuthorRecord' }
 *       '400': { $ref: '#/components/responses/AuthorBadRequest' }
 *       '404': { $ref: '#/components/responses/AuthorNotFound' }
 *       '500': { $ref: '#/components/responses/AuthorServerError' }
 *   delete:
 *     summary: Delete an author by ID
 *     tags: [Authors]
 *     responses:
 *       '204':
 *         description: Author deleted
 *       '404': { $ref: '#/components/responses/AuthorNotFound' }
 *       '409':
 *         description: Author still has books
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AuthorError' }
 *             example: { message: Author still has books }
 *       '500': { $ref: '#/components/responses/AuthorServerError' }
 */
router.get('/authors', getAllAuthors);
router.get('/authors/:id', getAuthorById);
router.post('/authors', createAuthor);
router.put('/authors/:id', updateAuthor);
router.delete('/authors/:id', deleteAuthor);

export default router;