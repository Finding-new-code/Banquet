import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
    timestamps: true,
    collection: 'refresh_tokens',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class RefreshToken {
    _id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    userId: Types.ObjectId;

    @Prop({ required: true, unique: true, index: true })
    token: string; // Hashed token

    @Prop({ required: true, index: true })
    expiresAt: Date;

    @Prop({ default: false, index: true })
    isRevoked: boolean;

    // Device tracking for security
    @Prop()
    deviceInfo: string;

    @Prop()
    ipAddress: string;

    @Prop()
    userAgent: string;

    @Prop()
    revokedAt: Date;

    createdAt: Date;
}

export type RefreshTokenDocument = RefreshToken & Document;
export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

RefreshTokenSchema.virtual('id').get(function (this: RefreshTokenDocument) {
    return this._id.toHexString();
});

// Virtual populate for user
RefreshTokenSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true,
});

// TTL index to automatically delete expired tokens after 30 days
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });
