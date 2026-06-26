const mongoose = require('mongoose');
const { Schema } = mongoose;

const LoginHistorySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  device: {
    device_id: String,
    browser: String,
    os: String,
    ip_address: String,
    login_time: Date,
    user_agent: String,
  },
  loginTime: { type: Date, default: Date.now },
  logoutTime: Date,
  status: { type: String, enum: ['success', 'failed', 'blocked'], default: 'success' },
});

LoginHistorySchema.index({ userId: 1, loginTime: -1 });

module.exports = mongoose.model('LoginHistory', LoginHistorySchema);
