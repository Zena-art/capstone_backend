// backend/models/Order.js
import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  orderItems: [
    {
      book: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Book'
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
      },
      price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
      }
    }
  ],
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['Credit Card', 'PayPal', 'Stripe']
  },
  paymentResult: {
    id: { type: String },
    status: { type: String },
    update_time: { type: String },
    email_address: { type: String }
  },
  itemsPrice: {
    type: Number,
    required: true,
    min: [0, 'Items price cannot be negative']
  },
  taxPrice: {
    type: Number,
    required: true,
    min: [0, 'Tax price cannot be negative']
  },
  shippingPrice: {
    type: Number,
    required: true,
    min: [0, 'Shipping price cannot be negative']
  },
  totalPrice: {
    type: Number,
    required: true,
    min: [0, 'Total price cannot be negative']
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

// Virtual for order's URL
OrderSchema.virtual('url').get(function() {
  return `/order/${this._id}`;
});

// Method to calculate total price
OrderSchema.methods.calculateTotalPrice = function() {
  this.itemsPrice = this.orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  this.taxPrice = this.itemsPrice * 0.15; // Assuming 15% tax
  this.shippingPrice = this.itemsPrice > 100 ? 0 : 10; // Free shipping for orders over $100
  this.totalPrice = this.itemsPrice + this.taxPrice + this.shippingPrice;
};

// Pre-save hook to calculate total price
OrderSchema.pre('save', function(next) {
  if (this.isModified('orderItems')) {
    this.calculateTotalPrice();
  }
  next();
});

// Static method to get total sales
OrderSchema.statics.getTotalSales = async function() {
  const result = await this.aggregate([
    { $match: { isPaid: true } },
    { $group: { _id: null, totalSales: { $sum: '$totalPrice' } } }
  ]);
  return result[0]?.totalSales || 0;
};

export default mongoose.model('Order', OrderSchema);