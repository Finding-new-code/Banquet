import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { softDeletePlugin, auditFieldsPlugin, SoftDeleteDocument } from './base.schema';

// ============================================
// ENUMS
// ============================================

export enum UserRole {
    ADMIN = 'ADMIN',
    OWNER = 'OWNER',
    CUSTOMER = 'CUSTOMER',
}

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED',
    DELETED = 'DELETED',
}

// ============================================
// USER SCHEMA
// ============================================

@Schema({
    timestamps: true,
    collection: 'users',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class User {
    _id: Types.ObjectId;

    @Prop({ required: true, unique: true, index: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true, enum: UserRole, type: String, index: true })
    role: UserRole;

    @Prop({ enum: UserStatus, type: String, default: UserStatus.ACTIVE, index: true })
    status: UserStatus;

    // Audit fields (will be added by plugin)
    @Prop({ type: Date, default: null, index: true })
    deletedAt: Date | null;

    @Prop({ type: String, default: null })
    createdBy: string | null;

    @Prop({ type: String, default: null })
    updatedBy: string | null;

    // Timestamps (added by Mongoose)
    createdAt: Date;
    updatedAt: Date;
}

export type UserDocument = User & Document & SoftDeleteDocument;
export const UserSchema = SchemaFactory.createForClass(User);

// Apply plugins
UserSchema.plugin(softDeletePlugin);
UserSchema.plugin(auditFieldsPlugin);

// Virtual for id string
UserSchema.virtual('id').get(function (this: UserDocument) {
    return this._id.toHexString();
});
