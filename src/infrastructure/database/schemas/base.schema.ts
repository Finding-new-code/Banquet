import { Schema, Document, Model, Query } from 'mongoose';

/**
 * Soft delete plugin for Mongoose schemas
 * Adds deletedAt field and automatically filters out soft-deleted records
 */
export function softDeletePlugin(schema: Schema) {
    // Add deletedAt field
    schema.add({
        deletedAt: { type: Date, default: null },
    });

    // Create index for deletedAt field
    schema.index({ deletedAt: 1 });

    // Pre-find hooks to filter out soft-deleted documents
    const filterDeleted = function (this: Query<any, any>) {
        // Only filter if includeDeleted is not set or is false
        const options = this.getOptions();
        if (!options.includeDeleted) {
            this.where({ deletedAt: null });
        }
    };

    schema.pre('find', filterDeleted);
    schema.pre('findOne', filterDeleted);
    schema.pre('findOneAndUpdate', filterDeleted);
    schema.pre('countDocuments', filterDeleted);

    // Add soft delete method
    schema.methods.softDelete = async function () {
        this.deletedAt = new Date();
        return this.save();
    };

    // Add restore method
    schema.methods.restore = async function () {
        this.deletedAt = null;
        return this.save();
    };

    // Static method to find including deleted documents
    schema.statics.findWithDeleted = function (filter = {}) {
        return this.find(filter).setOptions({ includeDeleted: true });
    };

    // Static method to find only deleted documents
    schema.statics.findDeleted = function (filter = {}) {
        return this.find({ ...filter, deletedAt: { $ne: null } }).setOptions({ includeDeleted: true });
    };
}

/**
 * Audit fields plugin for Mongoose schemas
 * Adds createdBy and updatedBy fields
 */
export function auditFieldsPlugin(schema: Schema) {
    schema.add({
        createdBy: { type: String, default: null },
        updatedBy: { type: String, default: null },
    });
}

// Export interfaces for typed soft delete methods
export interface SoftDeleteDocument extends Document {
    deletedAt: Date | null;
    softDelete(): Promise<this>;
    restore(): Promise<this>;
}

export interface SoftDeleteModel<T extends SoftDeleteDocument> extends Model<T> {
    findWithDeleted(filter?: object): Query<T[], T>;
    findDeleted(filter?: object): Query<T[], T>;
}
