const mongoose = require('mongoose');
const { Schema } = mongoose;

const InvoiceItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String, required: true },
  description: String,
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
});

const InvoiceSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  customer: {
    name: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    company: String,
  },
  invoiceNumber: { type: String, required: true, unique: true },
  items: [InvoiceItemSchema],
  subtotal: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  shippingAmount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  currency: { type: String, default: 'PKR' },
  status: { type: String, enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'], default: 'draft' },
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  notes: String,
  termsAndConditions: String,
  qrCode: String,
  signature: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

InvoiceSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

InvoiceSchema.index({ userId: 1, invoiceNumber: 1 });
InvoiceSchema.index({ userId: 1, customerId: 1 });
InvoiceSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Invoice', InvoiceSchema);
