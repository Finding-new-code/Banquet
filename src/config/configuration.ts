/**
 * Centralized configuration loader
 * Exports typed configuration objects for use throughout the application
 */
export default () => ({
    app: {
        env: process.env.NODE_ENV || 'development',
        port: parseInt(process.env.PORT || '3000', 10),
        name: process.env.APP_NAME || 'CYNERZA Backend API',
        version: process.env.APP_VERSION || '1.0.0',
    },
    database: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/cynerza_db',
    },
    security: {
        jwt: {
            accessSecret: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || '',
            accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
            refreshSecret: process.env.JWT_REFRESH_SECRET || '',
            refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
        },
        bcrypt: {
            rounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
        },
        otp: {
            length: parseInt(process.env.OTP_LENGTH || '6', 10),
            expiration: parseInt(process.env.OTP_EXPIRATION || '300', 10), // 5 minutes in seconds
            maxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS || '3', 10),
        },
        rateLimit: {
            loginAttemptLimit: parseInt(process.env.LOGIN_ATTEMPT_LIMIT || '5', 10),
            loginAttemptWindow: parseInt(process.env.LOGIN_ATTEMPT_WINDOW || '900', 10), // 15 minutes in seconds
        },
    },
    cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || [],
        credentials: process.env.CORS_CREDENTIALS === 'true',
    },
    throttle: {
        ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
        limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: process.env.LOG_FORMAT || 'json',
    },
    swagger: {
        enabled: process.env.SWAGGER_ENABLED === 'true',
        path: process.env.SWAGGER_PATH || 'api/docs',
    },
    health: {
        enabled: process.env.HEALTH_CHECK_ENABLED === 'true',
        diskThreshold: parseInt(process.env.DISK_THRESHOLD_PERCENT || '90', 10),
        memoryHeapThreshold: process.env.MEMORY_HEAP_THRESHOLD || '150MB',
    },
});
