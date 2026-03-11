// server.js
const express      = require('express');
const cors         = require('cors');
const cron         = require('node-cron');
const errorHandler = require('./middleware/errorHandler');
const ProcedureService = require('./services/procedureService');
require('dotenv').config();

const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth',          require('./routes/authRoutes'));
app.use('/api/borrow',        require('./routes/borrowRoutes'));      // ✅ was /api/borrows
app.use('/api/borrower',      require('./routes/borrowerRoutes'));
app.use('/api/owner',         require('./routes/ownerRoutes'));
app.use('/api/devices',       require('./routes/deviceRoutes'));
app.use('/api/waitlist',      require('./routes/waitlistRoutes'));
app.use('/api/damage',        require('./routes/damageRoutes'));
app.use('/api/broadcast',     require('./routes/broadcastRoutes'));
app.use('/api/fines',         require('./routes/fineRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin',         require('./routes/adminRoutes'));
app.use('/api/stats',         require('./routes/statsRoutes'));        // ✅ was missing

// Health check
app.get('/', (req, res) => {
    res.json({ message: 'StackShare Backend is running!' });
});

app.use(errorHandler);

// Daily return reminder — runs at 8:00 AM every day
cron.schedule('0 8 * * *', async () => {
    console.log('[CRON] Running daily return reminders...');
    try {
        await ProcedureService.sendReturnReminders();
        console.log('[CRON] Return reminders sent successfully');
    } catch (err) {
        console.error('[CRON] Return reminders failed:', err.message);
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});