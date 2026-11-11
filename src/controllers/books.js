import * as booksModel from '../models/books.js';
import { runRelationshipWrite } from '../db/relationship-writes.js';

const idPattern = /^[A-Za-z0-9_-]+$/;

const isCustomId = (value) => {
  return typeof value === 'string' && idPattern.test(value);
};

const isPublicationDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const validateBookBody = (body, includeId) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return 'Request body must be a JSON object';
  }

  const allowedFields = ['authorId', 'title', 'publicationDate'];
  if (includeId) {
    allowedFields.push('id');
  }

  if (Object.keys(body).some((field) => {
    return !allowedFields.includes(field);
  })) {
    return 'Request body contains an unexpected field';
  }

  if (includeId && !isCustomId(body.id)) {
    return 'id must contain only letters, digits, hyphens, or underscores';
  }

  if (!isCustomId(body.authorId)) {
    return 'authorId must contain only letters, digits, hyphens, or underscores';
  }

  if (typeof body.title !== 'string' || body.title.trim() === '') {
    return 'title must be a nonempty string';
  }

  if (!isPublicationDate(body.publicationDate)) {
    return 'publicationDate must be a valid date in YYYY-MM-DD format';
  }

  return null;
};

const getBookFields = ({ authorId, title, publicationDate }) => {
  return { authorId, title: title.trim(), publicationDate };
};

const sendServerError = (res, error) => {
  console.error('Book API request failed:', error.message);
  return res.status(500).json({ message: 'Internal server error' });
};

const getBooksHandler = async (req, res) => {
  try {
    const books = await booksModel.getAllBooks();
    return res.status(200).json(books);
  } catch (error) {
    return sendServerError(res, error);
  }
};

const getBookByIdHandler = async (req, res) => {
  try {
    const book = await booksModel.getBookById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json(book);
  } catch (error) {
    return sendServerError(res, error);
  }
};

const createBookHandler = async (req, res) => {
  const message = validateBookBody(req.body, true);
  if (message) {
    return res.status(400).json({ message });
  }

  const book = { id: req.body.id, ...getBookFields(req.body) };

  try {
    const result = await runRelationshipWrite(async () => {
      if (!(await booksModel.authorExists(book.authorId))) {
        return { status: 400, body: { message: 'Author ID does not exist' } };
      }

      const createdBook = await booksModel.createBook(book);
      return { status: 201, body: createdBook };
    });

    return res.status(result.status).json(result.body);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: 'Book ID already exists' });
    }

    return sendServerError(res, error);
  }
};

const updateBookHandler = async (req, res) => {
  const message = validateBookBody(req.body, false);
  if (message) {
    return res.status(400).json({ message });
  }

  const { id } = req.params;
  const fields = getBookFields(req.body);

  try {
    const result = await runRelationshipWrite(async () => {
      if (!(await booksModel.getBookById(id))) {
        return { status: 404, body: { message: 'Book not found' } };
      }

      if (!(await booksModel.authorExists(fields.authorId))) {
        return { status: 400, body: { message: 'Author ID does not exist' } };
      }

      const updatedBook = await booksModel.updateBook(id, fields);
      if (!updatedBook) {
        return { status: 404, body: { message: 'Book not found' } };
      }

      return { status: 200, body: updatedBook };
    });

    return res.status(result.status).json(result.body);
  } catch (error) {
    return sendServerError(res, error);
  }
};

const deleteBookHandler = async (req, res) => {
  try {
    const result = await booksModel.deleteBook(req.params.id);

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(204).end();
  } catch (error) {
    return sendServerError(res, error);
  }
};

export {
  getBooksHandler,
  getBookByIdHandler,
  createBookHandler,
  updateBookHandler,
  deleteBookHandler,
};