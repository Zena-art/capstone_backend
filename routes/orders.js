import express from 'express';
import Order from '../models/Order.js';
import Book from '../models/Book.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Place a new order (protected route for authenticated users)
router.post('/', auth, async (req, res) => {
  console.log('Received order creation request');
  console.log('Request body:', req.body);

  const { items, shippingAddress } = req.body;

  try {
    // Check stock
    for (let item of items) {
      console.log(`Checking book: ${item.book}`);
      const book = await Book.findById(item.book);
      if (!book) {
        console.log(`Book not found: ${item.book}`);
        return res.status(404).json({ message: `Book not found: ${item.book}` });
      }
      console.log(`Book found: ${book.title}, Stock: ${book.stockQuantity}`);
      if (book.stockQuantity < item.quantity) {
        console.log(`Insufficient stock for book: ${book.title}`);
        return res.status(400).json({ message: `Not enough stock for book: ${book.title}. Available: ${book.stockQuantity}, Requested: ${item.quantity}` });
      }
    }

    console.log('All books verified, creating order');
    // If all checks pass, create and save the order
    const order = new Order({
      user: req.user.id,
      items,
      shippingAddress
    });

    // Update book quantities
    for (let item of items) {
      await Book.findByIdAndUpdate(item.book, { $inc: { stockQuantity: -item.quantity } });
      console.log(`Updated stock for book: ${item.book}`);
    }

    await order.save();
    console.log('Order saved successfully');
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
});

export default router;