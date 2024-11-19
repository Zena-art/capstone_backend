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
    default: 'No description available',
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
    trim: true
  },
  coverImage: {
    type: String,
    default: 'https://covers.openlibrary.org/b/id/-1-L.jpg'
  },
  category: {
    type: String,
    default: 'Other',
    enum: ['Fiction', 'Non-fiction', 'Science', 'Technology', 'History', 'Biography', 'Self-help', 'Children', 'Other']
  },
  stockQuantity: {
    type: Number,
    required: [true, 'Please enter stock quantity'],
    min: [0, 'Stock quantity cannot be negative']
  },
  publisher: {
    type: String,
    default: 'Unknown'
  },
  publicationYear: {
    type: Number,
    default: new Date().getFullYear()
  }
}, {
  timestamps: true,
  strict: false  // This will allow additional fields to be stored without validation
});

export default mongoose.model('Book', BookSchema);