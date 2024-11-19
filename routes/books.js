import express from 'express';
import { body, validationResult } from 'express-validator';
import Book from '../models/Book.js';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';
import { fetchBookByISBN, searchBooks } from '../utils/openLibraryApi.js';

const router = express.Router();

// Get all books
router.get('/', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Add a new book (admin only)
router.post('/', [auth, admin, 
  body('isbn').notEmpty().withMessage('ISBN is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('stockQuantity').isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { isbn, price, stockQuantity } = req.body;
    const bookData = await fetchBookByISBN(isbn);

    if (!bookData) {
      return res.status(404).json({ msg: 'Book not found in Open Library' });
    }

    const newBook = new Book({
      ...bookData,
      price,
      stockQuantity
    });

    const book = await newBook.save();
    res.status(201).json(book);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ... (other routes remain the same)

export default router;