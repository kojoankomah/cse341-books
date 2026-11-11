import { getDb } from '../db/connect.js';

const bookProjection = { _id: 0, id: 1, authorId: 1, title: 1, publicationDate: 1 };

const getAllBooks = async () => {
  const collection = getDb().collection('books');
  return collection.find({}, { projection: bookProjection }).toArray();
};

const getBookById = async (bookId) => {
  const collection = getDb().collection('books');
  return collection.findOne({ id: bookId }, { projection: bookProjection });
};

const createBook = async (book) => {
  const collection = getDb().collection('books');
  await collection.insertOne({ ...book });
  return book;
};

const updateBook = async (bookId, book) => {
  const collection = getDb().collection('books');
  const result = await collection.updateOne({ id: bookId }, { $set: book });

  if (result.matchedCount === 0) {
    return null;
  }

  return { id: bookId, ...book };
};

const deleteBook = async (bookId) => {
  const collection = getDb().collection('books');
  return collection.deleteOne({ id: bookId });
};

const authorExists = async (authorId) => {
  const collection = getDb().collection('authors');
  const author = await collection.findOne(
    { id: authorId },
    { projection: { _id: 1 } },
  );

  return author !== null;
};

export {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  authorExists,
};