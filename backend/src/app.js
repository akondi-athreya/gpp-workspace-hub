const express = require('express');
const cors = require('cors');
const { env } = require('./config/env');
const { errorHandler } = require('./middleware/error');
const { success } = require('./utils/responses');
const { prisma } = require('./db/client');

// Import routes
const authRoutes = require('./routes/auth.routes');
const tenantsRoutes = require('./routes/tenants.routes');
const usersRoutes = require('./routes/users.routes');
const projectsRoutes = require('./routes/projects.routes');
const tasksRoutes = require('./routes/tasks.routes');

const app = express();

// CORS configuration
app.use(
    cors({
        origin: (origin, callback) => {
            const normalize = (value) => (value ? value.replace(/\/$/, '') : value);
            const allowedOrigins = [
                env.frontendUrl,
                env.frontendUrl?.replace(/^http:\/\//, 'https://'),
                'http://localhost:3000',
                'http://127.0.0.1:3000',
                'http://frontend:3000',
            ]
                .filter(Boolean)
                .map(normalize);

            const normalizedOrigin = normalize(origin);

            if (!normalizedOrigin || allowedOrigins.includes(normalizedOrigin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get('/', (req, res) => {
    return res.status(200).json({ message: 'API is running' });
});

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

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantsRoutes);
app.use('/api', usersRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api', tasksRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
