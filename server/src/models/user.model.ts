import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

export interface IUser extends Document {
    username: string;
    email: string;
    passwordHash: string;
    phone: string;
    deleted_at: Date | null;
    created_at: Date;
    updated_at: Date;
}

const userSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
            maxlength: 30,
        },
        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        passwordHash: {
            type: String,
            required: true,
        },
        deleted_at: {
            type: Date,
            default: null,
        },
        created_at: {
            type: Date,
            default: Date.now,
        },
        updated_at: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        toJSON: {
            transform(_doc, ret: Record<string, unknown>) {
                delete ret['passwordHash'];
                delete ret['__v'];
                return ret;
            },
        },
    }
);

export const User = mongoose.model<IUser>('User', userSchema);
