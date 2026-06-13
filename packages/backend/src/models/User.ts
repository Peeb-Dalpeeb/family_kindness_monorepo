import { Schema, model } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'standard'], required: true },
  avatar: { type: String, default: '' },
  color: { type: String, default: '#3B82F6' },
});

export const UserModel = model('User', UserSchema);
