import { getDb } from '../db/connect.js';

const authorProjection = { _id: 0, id: 1, name: 1, birthYear: 1 };

const getAllAuthors = async () => {
  const collection = getDb().collection('authors');
  return collection.find({}, { projection: authorProjection }).toArray();
};

const getAuthorById = async (id) => {
  const collection = getDb().collection('authors');
  return collection.findOne({ id }, { projection: authorProjection });
};

const createAuthor = async (author) => {
  const collection = getDb().collection('authors');
  await collection.insertOne({ ...author });
  return author;
};

const updateAuthor = async (id, author) => {
  const collection = getDb().collection('authors');
  const result = await collection.updateOne({ id }, { $set: author });

  if (result.matchedCount === 0) {
    return null;
  }

  return { id, ...author };
};

const deleteAuthor = async (id) => {
  const collection = getDb().collection('authors');
  return collection.deleteOne({ id });
};

const authorHasBooks = async (id) => {
  const collection = getDb().collection('books');
  const book = await collection.findOne(
    { authorId: id },
    { projection: { _id: 1 } },
  );

  return book !== null;
};

export {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  authorHasBooks,
};