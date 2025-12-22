const app = require('./app');
const { env } = require('./config/env');
const { prisma } = require('./db/client');

const startServer = async () => {
    try {
        // Test database connection
        await prisma.$connect();
        console.log('✅ Database connected');

        // Start server
        const server = app.listen(env.port, '127.0.0.1', () => {
            console.log(`🚀 Server running on port ${env.port}`);
            console.log(`📝 Environment: ${env.nodeEnv}`);
            console.log(`🌐 CORS enabled for: ${env.frontendUrl}`);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
});

startServer();
