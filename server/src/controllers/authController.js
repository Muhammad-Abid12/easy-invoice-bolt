const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, LoginHistory } = require('../models');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );
};

const register = async (req, res) => {
  try {
    const { email, password, name, phone, company, deviceInfo } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    user = new User({
      email,
      password: hashedPassword,
      name,
      phone,
      company,
      trialStartDate: new Date(),
      trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      maxInvoices: 10,
      status: 'active',
    });

    if (deviceInfo) {
      user.device = deviceInfo;
    }

    await user.save();

    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        status: user.status,
        trialStartDate: user.trialStartDate,
        trialEndDate: user.trialEndDate,
        invoiceCount: user.invoiceCount,
        maxInvoices: user.maxInvoices,
        company: user.company,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, deviceInfo } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check device lock
    if (user.device && user.device.device_id && deviceInfo) {
      if (user.device.device_id !== deviceInfo.device_id) {
        await LoginHistory.create({
          userId: user._id,
          device: deviceInfo,
          status: 'blocked',
        });
        return res.status(403).json({
          message: 'This account is already active on another device.',
          requiresDeviceVerification: true,
        });
      }
    }

    // Update device and last login
    if (deviceInfo) {
      user.device = deviceInfo;
    }
    user.lastLogin = new Date();
    await user.save();

    await LoginHistory.create({
      userId: user._id,
      device: deviceInfo,
      status: 'success',
    });

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        status: user.status,
        trialStartDate: user.trialStartDate,
        trialEndDate: user.trialEndDate,
        invoiceCount: user.invoiceCount,
        maxInvoices: user.maxInvoices,
        company: user.company,
        device: user.device,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check trial expiry
    const trialExpired = new Date() > user.trialEndDate;
    const invoiceLimitReached = user.invoiceCount >= user.maxInvoices;

    if ((trialExpired || invoiceLimitReached) && user.role === 'customer') {
      user.status = 'locked';
      await user.save();
    }

    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, company } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (company) user.company = { ...user.company, ...company };

    await user.save();

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: 'If email exists, reset instructions sent' });
    }

    // In production, send email via Supabase or other email service
    res.json({ message: 'If email exists, reset instructions sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

const getLoginHistory = async (req, res) => {
  try {
    const history = await LoginHistory.find({ userId: req.user.id })
      .sort({ loginTime: -1 })
      .limit(20);

    res.json(history);
  } catch (error) {
    console.error('Get login history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const resetDevice = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.device = undefined;
    await user.save();

    res.json({ message: 'Device reset successfully' });
  } catch (error) {
    console.error('Reset device error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
  forgotPassword,
  logout,
  getLoginHistory,
  resetDevice,
};
