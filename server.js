// server.js
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/borrower', require('./routes/borrowerRoutes'));
app.use('/api/owner', require('./routes/ownerRoutes'));
app.use('/api/devices', require('./routes/deviceRoutes'));
app.use('/api/borrows', require('./routes/borrowRoutes'));
app.use('/api/waitlist', require('./routes/waitlistRoutes'));
app.use('/api/damage', require('./routes/damageRoutes'));
app.use('/api/broadcast', require('./routes/broadcastRoutes'));
app.use('/api/fines', require('./routes/fineRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'StackShare Backend is running!' });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
