
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import bookRoutes from './routes/books.js';
import orderRoutes from './routes/orders.js';




dotenv.config();

connectDB();

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5173'
]

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - body:`, req.body);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/orders', orderRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to PageTurner API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Validation Error', errors: err.errors });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));