import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum OtpType {
    EMAIL = 'EMAIL',
    PHONE = 'PHONE',
}

@Schema({
    timestamps: true,
    collection: 'otp_verifications',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class OtpVerification {
    _id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', index: true })
    userId: Types.ObjectId | null;

    @Prop({ required: true, index: true })
    identifier: string; // Email or phone

    @Prop({ required: true })
    otp: string; // Hashed OTP

    @Prop({ required: true, enum: OtpType, type: String })
    type: OtpType;

    @Prop({ required: true, index: true })
    expiresAt: Date;

    @Prop({ default: false, index: true })
    isUsed: boolean;

    @Prop({ default: 0 })
    attempts: number;

    @Prop()
    usedAt: Date;

    createdAt: Date;
}

export type OtpVerificationDocument = OtpVerification & Document;
export const OtpVerificationSchema = SchemaFactory.createForClass(OtpVerification);

OtpVerificationSchema.virtual('id').get(function (this: OtpVerificationDocument) {
    return this._id.toHexString();
});

// Virtual populate for user
OtpVerificationSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true,
});

// TTL index to automatically delete expired OTPs after 24 hours
OtpVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 24 * 60 * 60 });
