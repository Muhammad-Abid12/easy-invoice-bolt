const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProductSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  sku: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  category: { type: String, required: true },
  unit: { type: String, default: 'piece' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ProductSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

ProductSchema.index({ userId: 1, sku: 1 }, { unique: true });
ProductSchema.index({ userId: 1, name: 'text', sku: 'text' });

module.exports = mongoose.model('Product', ProductSchema);
