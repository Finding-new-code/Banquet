import { Injectable, Logger, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import { OtpVerification, OtpVerificationDocument, OtpType } from '@infrastructure/database/schemas/otp-verification.schema';

/**
 * OTP Service
 * Generates and validates one-time passwords for email/phone verification
 */
@Injectable()
export class OtpService {
    private readonly logger = new Logger(OtpService.name);
    private readonly otpLength: number;
    private readonly otpExpiration: number; // in seconds
    private readonly maxAttempts: number;
    private readonly isDevelopment: boolean;

    constructor(
        private configService: ConfigService,
        @InjectModel(OtpVerification.name) private otpModel: Model<OtpVerificationDocument>,
    ) {
        this.otpLength = this.configService.get<number>('security.otp.length') || 6;
        this.otpExpiration = this.configService.get<number>('security.otp.expiration') || 300; // 5 minutes
        this.maxAttempts = this.configService.get<number>('security.otp.maxAttempts') || 3;
        this.isDevelopment = this.configService.get<string>('app.env') === 'development';
    }

    /**
     * Generate a cryptographically secure OTP code
     */
    private generateOtpCode(): string {
        const max = Math.pow(10, this.otpLength);
        const randomNumber = crypto.randomInt(0, max);
        return randomNumber.toString().padStart(this.otpLength, '0');
    }

    /**
     * Hash OTP before storing in database
     */
    private hashOtp(otp: string): string {
        return crypto.createHash('sha256').update(otp).digest('hex');
    }

    /**
     * Generate and store OTP for verification
     * @param identifier - Email or phone number
     * @param type - OTP type (EMAIL or PHONE)
     * @param userId - Optional user ID if user is logged in
     * @returns The OTP code (only in development mode, otherwise returns success message)
     */
    async generateOtp(
        identifier: string,
        type: OtpType,
        userId?: string,
    ): Promise<{ otp?: string; message: string }> {
        // Invalidate all previous OTPs for this identifier
        await this.otpModel.updateMany(
            {
                identifier,
                type,
                isUsed: false,
            },
            {
                isUsed: true,
            },
        ).exec();

        // Generate new OTP
        const otp = this.generateOtpCode();
        const hashedOtp = this.hashOtp(otp);

        // Calculate expiration
        const expiresAt = new Date(Date.now() + this.otpExpiration * 1000);

        // Store in database
        await this.otpModel.create({
            identifier,
            otp: hashedOtp,
            type,
            expiresAt,
            userId: userId || null,
        });

        // In development, log the OTP and return it
        // In production, this should trigger email/SMS sending
        if (this.isDevelopment) {
            this.logger.warn(`[DEV MODE] OTP for ${identifier}: ${otp}`);
            return {
                otp, // Only return in development
                message: 'OTP generated successfully (dev mode)',
            };
        }

        // TODO: Integrate with email/SMS service to send OTP
        this.logger.log(`OTP generated for ${identifier} (type: ${type})`);

        return {
            message: `OTP sent to ${type === OtpType.EMAIL ? 'email' : 'phone'}`,
        };
    }

    /**
     * Verify OTP code
     * @param identifier - Email or phone number
     * @param otp - OTP code to verify
     * @param type - OTP type (EMAIL or PHONE)
     * @returns True if OTP is valid
     */
    async verifyOtp(
        identifier: string,
        otp: string,
        type: OtpType,
    ): Promise<boolean> {
        const hashedOtp = this.hashOtp(otp);

        // Find the OTP record
        const otpRecord = await this.otpModel
            .findOne({
                identifier,
                type,
                isUsed: false,
            })
            .sort({ createdAt: -1 })
            .exec();

        if (!otpRecord) {
            this.logger.warn(`No active OTP found for ${identifier}`);
            throw new BadRequestException('Invalid or expired OTP');
        }

        // Check if expired
        if (otpRecord.expiresAt < new Date()) {
            this.logger.warn(`Expired OTP for ${identifier}`);
            throw new BadRequestException('OTP has expired');
        }

        // Check attempt count
        if (otpRecord.attempts >= this.maxAttempts) {
            this.logger.warn(`Max attempts reached for OTP: ${identifier}`);
            await this.otpModel.updateOne(
                { _id: otpRecord._id },
                { isUsed: true },
            ).exec();
            throw new UnauthorizedException('Maximum verification attempts exceeded');
        }

        // Increment attempts
        await this.otpModel.updateOne(
            { _id: otpRecord._id },
            { attempts: otpRecord.attempts + 1 },
        ).exec();

        // Verify OTP
        if (otpRecord.otp !== hashedOtp) {
            this.logger.warn(`Invalid OTP attempt for ${identifier}`);
            throw new BadRequestException('Invalid OTP code');
        }

        // Mark as used
        await this.otpModel.updateOne(
            { _id: otpRecord._id },
            {
                isUsed: true,
                usedAt: new Date(),
            },
        ).exec();

        this.logger.log(`OTP verified successfully for ${identifier}`);
        return true;
    }

    /**
     * Clean up expired OTPs (scheduled job)
     */
    async cleanExpiredOtps(): Promise<number> {
        const result = await this.otpModel.deleteMany({
            $or: [
                { expiresAt: { $lt: new Date() } },
                {
                    isUsed: true,
                    usedAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // 24 hours old
                },
            ],
        }).exec();

        this.logger.log(`Cleaned ${result.deletedCount} expired/used OTPs`);
        return result.deletedCount;
    }
}
