require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./src/routes/auth');
const historyRoutes = require('./src/routes/history');
const scoreRoutes = require('./src/routes/score');
const rideRoutes = require('./src/routes/ride');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/score', scoreRoutes);
app.use('/api/ride', rideRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Gig Sentry backend running on port ${PORT}`));
