import * as authorsModel from '../models/authors.js';
import { runRelationshipWrite } from '../db/relationship-writes.js';

const authorIdPattern = /^[A-Za-z0-9_-]+$/;

const validateAuthorBody = (body, includeId) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return 'Request body must be a JSON object';
  }

  const allowedFields = includeId ? ['id', 'name', 'birthYear'] : ['name', 'birthYear'];

  if (Object.keys(body).some((field) => {return !allowedFields.includes(field)})) {
    return 'Request body contains an unexpected field';
  }

  if (includeId && (typeof body.id !== 'string' || !authorIdPattern.test(body.id))) {
    return 'id must contain only letters, digits, hyphens, or underscores';
  }

  if (typeof body.name !== 'string' || body.name.trim() === '') {
    return 'name must be a nonempty string';
  }

  const currentYear = new Date().getUTCFullYear();
  if (!Number.isInteger(body.birthYear) || body.birthYear < 1 || body.birthYear > currentYear) {
    return 'birthYear must be an integer from 1 through the current UTC year';
  }

  return null;
};

const sendServerError = (res, error) => {
  console.error('Author API request failed', error);
  return res.status(500).json({ message: 'Internal server error' });
};

const getAllAuthors = async (req, res) => {
  try {
    const authors = await authorsModel.getAllAuthors();
    return res.status(200).json(authors);
  } catch (error) {
    return sendServerError(res, error);
  }
};

const getAuthorById = async (req, res) => {
  try {
    const author = await authorsModel.getAuthorById(req.params.id);

    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    return res.status(200).json(author);
  } catch (error) {
    return sendServerError(res, error);
  }
};

const createAuthor = async (req, res) => {
  const message = validateAuthorBody(req.body, true);
  if (message) {
    return res.status(400).json({ message });
  }

  const { id, name, birthYear } = req.body;

  try {
    const author = await authorsModel.createAuthor({ id, name: name.trim(), birthYear });
    return res.status(201).json(author);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: 'Author ID already exists' });
    }

    return sendServerError(res, error);
  }
};

const updateAuthor = async (req, res) => {
  const message = validateAuthorBody(req.body, false);
  if (message) {
    return res.status(400).json({ message });
  }

  const { name, birthYear } = req.body;

  try {
    const author = await authorsModel.updateAuthor(req.params.id, {
      name: name.trim(),
      birthYear,
    });

    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    return res.status(200).json(author);
  } catch (error) {
    return sendServerError(res, error);
  }
};

const deleteAuthor = async (req, res) => {
  const { id } = req.params;

  try {
    const status = await runRelationshipWrite(async () => {
      const author = await authorsModel.getAuthorById(id);
      if (!author) {
        return 404;
      }

      if (await authorsModel.authorHasBooks(id)) {
        return 409;
      }

      const result = await authorsModel.deleteAuthor(id);
      return result.deletedCount === 1 ? 204 : 404;
    });

    if (status === 404) {
      return res.status(404).json({ message: 'Author not found' });
    }

    if (status === 409) {
      return res.status(409).json({ message: 'Author still has books' });
    }

    return res.status(204).end();
  } catch (error) {
    return sendServerError(res, error);
  }
};

export {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
};