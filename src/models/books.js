import { getDb } from '../db/connect.js';

const getAllBooks = async () => {
  const books = await getDb()
    .collection('books')
    .find({})
    .toArray();

  return books;
};

export { getAllBooks };