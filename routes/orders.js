// backend/routes/orders.js
import express from 'express';
import Order from '../models/Order.js';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';

const router = express.Router();

// Create a new order (protected route for authenticated users)
router.post('/', auth, async (req, res) => {
  const { items, totalAmount, shippingAddress } = req.body;

  try {
    const order = new Order({
      user: req.user.id,
      items,
      totalAmount,
      shippingAddress,
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all orders (admin-only route)
router.get('/', [auth, admin], async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email') // Populate user info
      .populate('items.book', 'title author'); // Populate book info
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific order by ID (protected route)
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.book', 'title author');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Allow access only to the order owner or an admin
    if (order.user._id.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update the status of an order (admin-only route)
router.put('/:id/status', [auth, admin], async (req, res) => {
  const { status } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete an order (admin-only route)
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
