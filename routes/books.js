import express from "express";
import Book from "../models/Book.js";
import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";

const router = express.Router();

// Public routes

// Define a route to handle GET requests to the /books endpoint
// This route retrieves a list of all books from the database
router.get("/", async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Define a route to handle GET requests to the /books/:id endpoint
// This route retrieves a single book from the database by its ID

router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ msg: "Book not found" });
    }
    res.json(book);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Protected admin routes

// Define a route to handle POST requests to the /books endpoint
// This route creates a new book in the database
// It requires authentication and admin privileges
router.post("/", [auth, admin], async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

// Define a route to handle PUT requests to the /books/:id endpoint
// This route updates a single book in the database by its ID
// It requires authentication and admin privileges

router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// Define a route to handle DELETE requests to the /books/:id endpoint
// This route deletes a single book from the database by its ID
// It requires authentication and admin privileges
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;