import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

/**
 * Password Service
 * Handles all password-related operations with security best practices
 */
@Injectable()
export class PasswordService {
    private readonly logger = new Logger(PasswordService.name);
    private readonly bcryptRounds: number;

    constructor(private configService: ConfigService) {
        this.bcryptRounds = this.configService.get<number>('security.bcrypt.rounds') || 12;
    }

    /**
     * Hash a password using bcrypt
     * @param password - Plain text password
     * @returns Hashed password
     */
    async hashPassword(password: string): Promise<string> {
        try {
            const hash = await bcrypt.hash(password, this.bcryptRounds);
            this.logger.debug('Password hashed successfully');
            return hash;
        } catch (error) {
            this.logger.error('Failed to hash password', error.stack);
            throw new Error('Password hashing failed');
        }
    }

    /**
     * Verify a password against its hash
     * Uses constant-time comparison to prevent timing attacks
     * @param password - Plain text password
     * @param hash - Hashed password
     * @returns True if password matches hash
     */
    async verifyPassword(password: string, hash: string): Promise<boolean> {
        try {
            const isMatch = await bcrypt.compare(password, hash);
            this.logger.debug(`Password verification: ${isMatch ? 'success' : 'failed'}`);
            return isMatch;
        } catch (error) {
            this.logger.error('Failed to verify password', error.stack);
            return false;
        }
    }

    /**
     * Validate password strength
     * Requirements:
     * - Minimum 8 characters
     * - At least one uppercase letter
     * - At least one lowercase letter
     * - At least one number
     * - At least one special character
     * @param password - Password to validate
     * @returns Object with validation result and error messages
     */
    validatePasswordStrength(password: string): {
        isValid: boolean;
        errors: string[]
    } {
        const errors: string[] = [];

        if (!password || password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }

        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }

        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }

        if (!/[0-9]/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }
}
