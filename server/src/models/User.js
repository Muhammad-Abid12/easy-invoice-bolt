const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['customer', 'super_admin'], default: 'customer' },
  status: { type: String, enum: ['active', 'locked', 'pending'], default: 'pending' },

  company: {
    name: String,
    logo: String,
    address: String,
    city: String,
    state: String,
    country: { type: String, default: 'Pakistan' },
    postalCode: String,
    phone: String,
    email: String,
    website: String,
    ntn: String,
    stn: String,
  },

  trialStartDate: { type: Date, default: Date.now },
  trialEndDate: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  invoiceCount: { type: Number, default: 0 },
  maxInvoices: { type: Number, default: 10 },

  device: {
    device_id: String,
    browser: String,
    os: String,
    ip_address: String,
    login_time: Date,
    user_agent: String,
  },

  lastLogin: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

UserSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('User', UserSchema);
