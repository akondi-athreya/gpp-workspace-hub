require('dotenv').config();

const env = {
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    jwtSecret: process.env.JWT_SECRET || 'fallback_secret_change_in_production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    databaseUrl: process.env.DATABASE_URL || '',
};

// Validate critical env vars
if (!env.jwtSecret || env.jwtSecret === 'fallback_secret_change_in_production') {
    console.warn('⚠️  JWT_SECRET not set or using fallback. Set a strong secret in .env');
}

if (!env.databaseUrl) {
    throw new Error('❌ DATABASE_URL is required');
}

module.exports = { env };
