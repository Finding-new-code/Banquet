import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global HTTP exception filter
 * Provides standardized error responses across the application
 * Enhanced with auth error handling and security sanitization
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let errors: any = null;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'object') {
                message =
                    (exceptionResponse as any).message || exception.message;
                errors = (exceptionResponse as any).errors;
            } else {
                message = exceptionResponse;
            }
        } else if (exception instanceof Error) {
            message = exception.message;

            // Map JWT errors to appropriate status codes
            if (exception.name === 'JsonWebTokenError') {
                status = HttpStatus.UNAUTHORIZED;
                message = 'Invalid authentication token';
            } else if (exception.name === 'TokenExpiredError') {
                status = HttpStatus.UNAUTHORIZED;
                message = 'Authentication token expired';
            } else if (exception.name === 'NotBeforeError') {
                status = HttpStatus.UNAUTHORIZED;
                message = 'Token not yet valid';
            }
        }

        // Sanitize error message in production to avoid leaking sensitive information
        const isProduction = process.env.NODE_ENV === 'production';
        if (isProduction && status === HttpStatus.INTERNAL_SERVER_ERROR) {
            message = 'An unexpected error occurred';
            errors = null; // Don't expose internal errors in production
        }

        // Log the error (but never log passwords, tokens, or sensitive data)
        const sanitizedUrl = this.sanitizeUrl(request.url);
        this.logger.error(
            `${request.method} ${sanitizedUrl} - ${status} - ${message}`,
            exception instanceof Error ? exception.stack : '',
        );

        // Send standardized error response
        response.status(status).json({
            success: false,
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: sanitizedUrl,
            method: request.method,
            message,
            ...(errors && { errors }),
        });
    }

    /**
     * Sanitize URL to remove sensitive query parameters
     */
    private sanitizeUrl(url: string): string {
        // Remove common sensitive query parameters
        const sensitiveParams = ['token', 'password', 'secret', 'apikey', 'api_key'];
        let sanitized = url;

        for (const param of sensitiveParams) {
            const regex = new RegExp(`([?&])${param}=[^&]*`, 'gi');
            sanitized = sanitized.replace(regex, `$1${param}=***`);
        }

        return sanitized;
    }
}
