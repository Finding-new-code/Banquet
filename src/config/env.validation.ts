import * as Joi from 'joi';

/**
 * Environment variable validation schema
 * Ensures all required configuration is present and valid at application startup
 */
export const envValidationSchema = Joi.object({
    // Application
    NODE_ENV: Joi.string()
        .valid('development', 'staging', 'production', 'test')
        .required(),
    PORT: Joi.number().default(3000),
    APP_NAME: Joi.string().required(),
    APP_VERSION: Joi.string().required(),

    // Database
    MONGODB_URI: Joi.string().required(),

    // Security - JWT
    JWT_ACCESS_SECRET: Joi.string().min(32).required(),
    JWT_ACCESS_EXPIRATION: Joi.string().default('15m'),
    JWT_REFRESH_SECRET: Joi.string().min(32).required(),
    JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),
    BCRYPT_ROUNDS: Joi.number().min(10).max(15).default(10),

    // Rate Limiting - Login attempts
    LOGIN_ATTEMPT_LIMIT: Joi.number().default(5),
    LOGIN_ATTEMPT_WINDOW: Joi.number().default(900),

    // OTP Configuration
    OTP_LENGTH: Joi.number().default(6),
    OTP_EXPIRATION: Joi.number().default(300),
    OTP_MAX_ATTEMPTS: Joi.number().default(3),

    // CORS
    CORS_ORIGIN: Joi.string().required(),
    CORS_CREDENTIALS: Joi.boolean().default(true),

    // Rate Limiting
    THROTTLE_TTL: Joi.number().default(60),
    THROTTLE_LIMIT: Joi.number().default(100),

    // Logging
    LOG_LEVEL: Joi.string()
        .valid('error', 'warn', 'info', 'debug', 'verbose')
        .default('info'),
    LOG_FORMAT: Joi.string().valid('json', 'pretty').default('json'),

    // Swagger
    SWAGGER_ENABLED: Joi.boolean().default(false),
    SWAGGER_PATH: Joi.string().default('api/docs'),

    // Health Check
    HEALTH_CHECK_ENABLED: Joi.boolean().default(true),
    DISK_THRESHOLD_PERCENT: Joi.number().min(0).max(100).default(90),
    MEMORY_HEAP_THRESHOLD: Joi.string().default('150MB'),
});
