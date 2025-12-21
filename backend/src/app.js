const express = require('express');
const cors = require('cors');
const { env } = require('./config/env');
const { errorHandler } = require('./middleware/error');
const { success } = require('./utils/responses');
const { prisma } = require('./db/client');

const app = express();

// CORS configuration
app.use(
    cors({
        origin: env.frontendUrl,
        credentials: true,
    })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        // Check database connection
        await prisma.$queryRaw`SELECT 1`;
        return success(res, { status: 'ok', database: 'connected' });
    } catch (err) {
        return res.status(503).json({ status: 'error', database: 'disconnected' });
    }
});

// API routes will be mounted here
// app.use('/api/auth', authRoutes);
// app.use('/api/tenants', tenantRoutes);
// etc.

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
