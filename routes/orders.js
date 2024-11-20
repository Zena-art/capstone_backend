import express from 'express';
import { body, validationResult } from 'express-validator';
import Order from '../models/Order.js';
import Book from '../models/Book.js';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';
import mongoose from 'mongoose';

const router = express.Router();

// Get all orders (admin only)
router.get('/', [auth, admin], async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email');
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Get a specific order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.book');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if the user is an admin or if the order belongs to the user
    if (!req.user.isAdmin && order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(order);
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

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

    const order = new Order({
      user: req.user.id,
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

// Update a book (admin only)
router.put('/:id', [
  auth,
  admin,
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('author').optional().trim().notEmpty().withMessage('Author cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stockQuantity').optional().isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const bookId = req.params.id;
    const updateData = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Update only the fields that are provided
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        book[key] = updateData[key];
      }
    });

    await book.save();

    res.json(book);
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ message: 'Error updating book', error: error.message });
  }
});

// Get user's orders
router.get('/myorders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate('items.book');
    res.json(orders);
  } catch (err) {
    console.error('Error fetching user orders:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

export default router;