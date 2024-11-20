import express from 'express';
import { body, validationResult } from 'express-validator';
import Book from '../models/Book.js';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';
import { fetchBookByISBN } from '../utils/openLibraryApi.js';

const router = express.Router();

// Get all books with optional pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalBooks = await Book.countDocuments();
    const books = await Book.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      books,
      currentPage: page,
      totalPages: Math.ceil(totalBooks / limit),
      totalBooks
    });
  } catch (err) {
    console.error('Error in GET /api/books:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Get a single book by ID
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (err) {
    console.error('Error in GET /api/books/:id:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Add a new book (admin only)
router.post('/', [
  auth, 
  admin,
  body('isbn').notEmpty().withMessage('ISBN is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('stockQuantity').isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let bookData = req.body;

    // Fetch additional book data from Open Library API
    const openLibraryData = await fetchBookByISBN(bookData.isbn);
    if (openLibraryData) {
      // Merge the data, prioritizing the data from the request
      bookData = { ...openLibraryData, ...bookData };
    }

    const book = new Book(bookData);
    await book.save();
    res.status(201).json(book);
  } catch (err) {
    console.error('Error in POST /api/books:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Update a book (admin only)
router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (err) {
    console.error('Error in PUT /api/books/:id:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Delete a book (admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json({ message: 'Book removed' });
  } catch (err) {
    console.error('Error in DELETE /api/books/:id:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

export default router;