import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as crypto from 'crypto';
import { RefreshToken, RefreshTokenDocument } from '@infrastructure/database/schemas/refresh-token.schema';

export interface TokenPayload {
    sub: string; // User ID
    email: string;
    role: string;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

/**
 * Token Service
 * Manages JWT token generation, validation, and refresh token lifecycle
 */
@Injectable()
export class TokenService {
    private readonly logger = new Logger(TokenService.name);
    private readonly accessSecret: string;
    private readonly accessExpiration: string;
    private readonly refreshSecret: string;
    private readonly refreshExpiration: string;

    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
        @InjectModel(RefreshToken.name) private refreshTokenModel: Model<RefreshTokenDocument>,
    ) {
        this.accessSecret = this.configService.get<string>('security.jwt.accessSecret') || 'default-secret';
        this.accessExpiration = this.configService.get<string>('security.jwt.accessExpiration') || '15m';
        this.refreshSecret = this.configService.get<string>('security.jwt.refreshSecret') || 'default-refresh-secret';
        this.refreshExpiration = this.configService.get<string>('security.jwt.refreshExpiration') || '7d';
    }

    /**
     * Generate access token (short-lived)
     */
    generateAccessToken(payload: TokenPayload): string {
        return this.jwtService.sign(
            { ...payload } as Record<string, unknown>,
            {
                secret: this.accessSecret,
                expiresIn: this.accessExpiration as any,
            },
        );
    }

    /**
     * Generate refresh token (long-lived) and store in database
     */
    async generateRefreshToken(
        userId: string,
        deviceInfo?: string,
        ipAddress?: string,
        userAgent?: string,
    ): Promise<string> {
        // Generate a cryptographically secure random token
        const token = crypto.randomBytes(64).toString('hex');

        // Hash the token before storing
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Calculate expiration time
        const expirationMs = this.parseExpiration(this.refreshExpiration);
        const expiresAt = new Date(Date.now() + expirationMs);

        // Store hashed token in database
        await this.refreshTokenModel.create({
            userId: new Types.ObjectId(userId),
            token: hashedToken,
            expiresAt,
            deviceInfo,
            ipAddress,
            userAgent,
        });

        this.logger.debug(`Refresh token generated for user: ${userId}`);
        return token; // Return unhashed token to send to client
    }

    /**
     * Generate both access and refresh tokens
     */
    async generateTokenPair(
        payload: TokenPayload,
        deviceInfo?: string,
        ipAddress?: string,
        userAgent?: string,
    ): Promise<TokenPair> {
        const accessToken = this.generateAccessToken(payload);
        const refreshToken = await this.generateRefreshToken(
            payload.sub,
            deviceInfo,
            ipAddress,
            userAgent,
        );

        return { accessToken, refreshToken };
    }

    /**
     * Verify access token
     */
    async verifyAccessToken(token: string): Promise<TokenPayload> {
        try {
            const payload = this.jwtService.verify<TokenPayload>(token, {
                secret: this.accessSecret,
            });
            return payload;
        } catch (error) {
            this.logger.warn('Invalid access token');
            throw new UnauthorizedException('Invalid or expired token');
        }
    }

    /**
     * Verify refresh token and return associated user ID
     */
    async verifyRefreshToken(token: string): Promise<string> {
        // Hash the provided token
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find token in database
        const storedToken = await this.refreshTokenModel
            .findOne({ token: hashedToken })
            .populate('user')
            .exec();

        if (!storedToken) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        if (storedToken.isRevoked) {
            this.logger.warn(`Attempt to use revoked token for user: ${storedToken.userId}`);
            throw new UnauthorizedException('Token has been revoked');
        }

        if (storedToken.expiresAt < new Date()) {
            this.logger.warn(`Expired refresh token for user: ${storedToken.userId}`);
            throw new UnauthorizedException('Refresh token expired');
        }

        return storedToken.userId.toHexString();
    }

    /**
     * Revoke a specific refresh token (logout)
     */
    async revokeRefreshToken(token: string): Promise<void> {
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        await this.refreshTokenModel.updateMany(
            { token: hashedToken },
            {
                isRevoked: true,
                revokedAt: new Date(),
            },
        ).exec();

        this.logger.debug('Refresh token revoked');
    }

    /**
     * Revoke all refresh tokens for a user (logout all sessions)
     */
    async revokeAllUserTokens(userId: string): Promise<void> {
        await this.refreshTokenModel.updateMany(
            {
                userId: new Types.ObjectId(userId),
                isRevoked: false,
            },
            {
                isRevoked: true,
                revokedAt: new Date(),
            },
        ).exec();

        this.logger.log(`All tokens revoked for user: ${userId}`);
    }

    /**
     * Clean up expired tokens (can be called by a scheduled job)
     */
    async cleanExpiredTokens(): Promise<number> {
        const result = await this.refreshTokenModel.deleteMany({
            expiresAt: { $lt: new Date() },
        }).exec();

        this.logger.log(`Cleaned ${result.deletedCount} expired tokens`);
        return result.deletedCount;
    }

    /**
     * Parse JWT expiration string to milliseconds
     */
    private parseExpiration(expiration: string): number {
        const matches = expiration.match(/^(\d+)([smhd])$/);
        if (!matches) {
            throw new Error('Invalid expiration format');
        }

        const value = parseInt(matches[1], 10);
        const unit = matches[2];

        const multipliers: Record<string, number> = {
            s: 1000,
            m: 60 * 1000,
            h: 60 * 60 * 1000,
            d: 24 * 60 * 60 * 1000,
        };

        return value * multipliers[unit];
    }
}
