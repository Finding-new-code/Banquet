import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
    timestamps: false,
    collection: 'login_attempts',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class LoginAttempt {
    _id: Types.ObjectId;

    @Prop({ required: true, index: true })
    identifier: string; // Email or username

    @Prop({ required: true, index: true })
    ipAddress: string;

    @Prop()
    userAgent: string;

    @Prop({ default: false })
    successful: boolean;

    @Prop({ default: Date.now, index: true })
    attemptedAt: Date;
}

export type LoginAttemptDocument = LoginAttempt & Document;
export const LoginAttemptSchema = SchemaFactory.createForClass(LoginAttempt);

LoginAttemptSchema.virtual('id').get(function (this: LoginAttemptDocument) {
    return this._id.toHexString();
});

// Compound index for efficient login attempt queries
LoginAttemptSchema.index({ identifier: 1, ipAddress: 1 });

// TTL index to automatically delete old login attempts after 7 days
LoginAttemptSchema.index({ attemptedAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });
