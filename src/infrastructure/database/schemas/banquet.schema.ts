import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { softDeletePlugin, auditFieldsPlugin, SoftDeleteDocument } from './base.schema';

// ============================================
// ENUMS
// ============================================

export enum BanquetStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    UNAVAILABLE = 'UNAVAILABLE',
    DELETED = 'DELETED',
}

// ============================================
// BANQUET SCHEMA
// ============================================

@Schema({
    timestamps: true,
    collection: 'banquets',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class Banquet {
    _id: Types.ObjectId;

    @Prop({ required: true })
    name: string;

    @Prop()
    description: string;

    // Location
    @Prop({ required: true })
    address: string;

    @Prop({ required: true, index: true })
    city: string;

    @Prop({ required: true })
    state: string;

    @Prop({ required: true })
    pincode: string;

    @Prop()
    latitude: number;

    @Prop()
    longitude: number;

    // Capacity and pricing
    @Prop({ required: true })
    capacity: number;

    @Prop({ type: Object, required: true })
    pricing: Record<string, any>;

    // Features and amenities
    @Prop({ type: Object })
    amenities: Record<string, any>;

    @Prop({ type: [String], default: [] })
    images: string[];

    // Status
    @Prop({ enum: BanquetStatus, type: String, default: BanquetStatus.DRAFT, index: true })
    status: BanquetStatus;

    // Owner reference
    @Prop({ type: Types.ObjectId, ref: 'OwnerProfile', required: true, index: true })
    ownerId: Types.ObjectId;

    // Audit fields
    @Prop({ type: Date, default: null, index: true })
    deletedAt: Date | null;

    @Prop({ type: String, default: null })
    createdBy: string | null;

    @Prop({ type: String, default: null })
    updatedBy: string | null;

    createdAt: Date;
    updatedAt: Date;
}

export type BanquetDocument = Banquet & Document & SoftDeleteDocument;
export const BanquetSchema = SchemaFactory.createForClass(Banquet);

BanquetSchema.plugin(softDeletePlugin);
BanquetSchema.plugin(auditFieldsPlugin);

BanquetSchema.virtual('id').get(function (this: BanquetDocument) {
    return this._id.toHexString();
});

// Virtual populate for owner
BanquetSchema.virtual('owner', {
    ref: 'OwnerProfile',
    localField: 'ownerId',
    foreignField: '_id',
    justOne: true,
});
