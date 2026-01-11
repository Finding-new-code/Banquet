import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { softDeletePlugin, auditFieldsPlugin, SoftDeleteDocument } from './base.schema';

@Schema({
    timestamps: true,
    collection: 'customer_profiles',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class CustomerProfile {
    _id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
    userId: Types.ObjectId;

    // Personal information
    @Prop({ required: true })
    firstName: string;

    @Prop({ required: true })
    lastName: string;

    @Prop({ required: true })
    phoneNumber: string;

    @Prop()
    address: string;

    @Prop()
    city: string;

    @Prop()
    state: string;

    @Prop()
    pincode: string;

    // Preferences (flexible JSON field)
    @Prop({ type: Object })
    preferences: Record<string, any>;

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

export type CustomerProfileDocument = CustomerProfile & Document & SoftDeleteDocument;
export const CustomerProfileSchema = SchemaFactory.createForClass(CustomerProfile);

CustomerProfileSchema.plugin(softDeletePlugin);
CustomerProfileSchema.plugin(auditFieldsPlugin);

CustomerProfileSchema.virtual('id').get(function (this: CustomerProfileDocument) {
    return this._id.toHexString();
});

// Virtual populate for user
CustomerProfileSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true,
});
