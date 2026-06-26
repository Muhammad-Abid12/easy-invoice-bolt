const mongoose = require('mongoose');
const { Schema } = mongoose;

const CustomerSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: String,
  country: { type: String, default: 'Pakistan' },
  postalCode: String,
  company: String,
  notes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

CustomerSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

CustomerSchema.index({ userId: 1, email: 1 }, { unique: true });
CustomerSchema.index({ userId: 1, name: 'text', email: 'text' });

module.exports = mongoose.model('Customer', CustomerSchema);
