import express from 'express';
import { body, validationResult } from 'express-validator';
import Order from '../models/Order.js';
import Book from '../models/Book.js';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';
import mongoose from 'mongoose';

const router = express.Router();

// Create a new order
router.post('/', [auth, 
  body('items').isArray().withMessage('Items must be an array'),
  body('items.*.book').isMongoId().withMessage('Invalid book ID'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('shippingAddress').isObject().withMessage('Shipping address must be an object'),
  body('shippingAddress.address').notEmpty().withMessage('Address is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.state').notEmpty().withMessage('State is required'),
  body('shippingAddress.postalCode').notEmpty().withMessage('Postal code is required'),
  body('shippingAddress.country').notEmpty().withMessage('Country is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { items, shippingAddress } = req.body;
    let totalAmount = 0;

    // Check stock and calculate total amount
    for (let item of items) {
      const book = await Book.findById(item.book);
      if (!book) {
        return res.status(404).json({ message: `Book not found: ${item.book}` });
      }
      if (book.stockQuantity < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for book: ${book.title}` });
      }
      totalAmount += book.price * item.quantity;
    }

    // Create a dummy user ID for testing purposes
    const dummyUserId = new mongoose.Types.ObjectId();

    const order = new Order({
      user: dummyUserId, // Use the dummy user ID
      items,
      shippingAddress,
      totalAmount
    });

    await order.save();

    // Update book quantities
    for (let item of items) {
      await Book.findByIdAndUpdate(item.book, { $inc: { stockQuantity: -item.quantity } });
    }

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
});

// ... (rest of the routes remain unchanged)

export default router;