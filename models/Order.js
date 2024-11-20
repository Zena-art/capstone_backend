import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  status: {
    type: String,
    default: 'Pending',
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered']
  }
}, {
  timestamps: true
});

export default mongoose.model('Order', OrderSchema);