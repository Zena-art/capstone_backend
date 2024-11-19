// backend/models/Book.js
import mongoose from 'mongoose';

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please enter book title'],
    trim: true,
    maxlength: [200, 'Book title cannot be more than 200 characters']
  },
  author: {
    type: String,
    required: [true, 'Please enter author name'],
    trim: true,
    maxlength: [100, 'Author name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please enter book description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please enter book price'],
    min: [0, 'Price must be a positive number']
  },
  isbn: {
    type: String,
    required: [true, 'Please enter ISBN'],
    unique: true,
    trim: true,
    match: [/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/, 'Please enter a valid ISBN']
  },
  coverImage: {
    type: String,
    required: [true, 'Please provide cover image URL']
  },
  category: {
    type: String,
    required: [true, 'Please specify the book category'],
    enum: ['Fiction', 'Non-fiction', 'Science', 'Technology', 'History', 'Biography', 'Self-help', 'Children', 'Other']
  },
  stockQuantity: {
    type: Number,
    required: [true, 'Please enter stock quantity'],
    min: [0, 'Stock quantity cannot be negative']
  },
  publisher: {
    type: String,
    required: [true, 'Please enter publisher name'],
    trim: true
  },
  publicationDate: {
    type: Date,
    required: [true, 'Please enter publication date']
  },
  language: {
    type: String,
    required: [true, 'Please specify the book language'],
    trim: true
  },
  pages: {
    type: Number,
    required: [true, 'Please enter the number of pages'],
    min: [1, 'Number of pages must be at least 1']
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating must be between 0 and 5'],
    max: [5, 'Rating must be between 0 and 5']
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true
    }
  }],
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('Book', BookSchema);