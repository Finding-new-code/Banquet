import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { softDeletePlugin, auditFieldsPlugin, SoftDeleteDocument } from './base.schema';

@Schema({
    timestamps: true,
    collection: 'owner_profiles',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class OwnerProfile {
    _id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
    userId: Types.ObjectId;

    // Business information
    @Prop({ required: true })
    businessName: string;

    @Prop({ required: true })
    contactNumber: string;

    @Prop()
    address: string;

    @Prop()
    city: string;

    @Prop()
    state: string;

    @Prop()
    pincode: string;

    @Prop({ unique: true, sparse: true })
    gstNumber: string;

    // Additional details
    @Prop()
    description: string;

    @Prop()
    website: string;

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

export type OwnerProfileDocument = OwnerProfile & Document & SoftDeleteDocument;
export const OwnerProfileSchema = SchemaFactory.createForClass(OwnerProfile);

OwnerProfileSchema.plugin(softDeletePlugin);
OwnerProfileSchema.plugin(auditFieldsPlugin);

OwnerProfileSchema.virtual('id').get(function (this: OwnerProfileDocument) {
    return this._id.toHexString();
});

// Virtual populate for user
OwnerProfileSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true,
});
