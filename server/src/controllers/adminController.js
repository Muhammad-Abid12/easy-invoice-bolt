const User = require('../models/User');
const Invoice = require('../models/Invoice');
const { Settings } = require('../models');

const getStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalCustomers,
      activeCustomers,
      lockedCustomers,
      trialUsers,
      expiredUsers,
      totalInvoices,
      todayInvoices,
      monthlyInvoices,
      totalRevenue,
      monthRevenue,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'customer', status: 'active' }),
      User.countDocuments({ role: 'customer', status: 'locked' }),
      User.countDocuments({ role: 'customer', trialEndDate: { $gte: today } }),
      User.countDocuments({ role: 'customer', trialEndDate: { $lt: today } }),
      Invoice.countDocuments(),
      Invoice.countDocuments({ issueDate: { $gte: today } }),
      Invoice.countDocuments({ issueDate: { $gte: firstDayOfMonth } }),
      Invoice.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
      Invoice.aggregate([{ $match: { issueDate: { $gte: firstDayOfMonth } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
    ]);

    res.json({
      totalCustomers,
      activeCustomers,
      lockedCustomers,
      trialUsers,
      expiredUsers,
      totalInvoices,
      todayInvoices,
      monthlyInvoices,
      totalRevenue: totalRevenue[0]?.total || 0,
      monthRevenue: monthRevenue[0]?.total || 0,
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getCustomers = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const query = { role: 'customer' };

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const customers = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      data: customers,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id).select('-password');

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const lockCustomer = async (req, res) => {
  try {
    const customer = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'locked' },
      { new: true }
    ).select('-password');

    res.json(customer);
  } catch (error) {
    console.error('Lock customer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const unlockCustomer = async (req, res) => {
  try {
    const customer = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'active' },
      { new: true }
    ).select('-password');

    res.json(customer);
  } catch (error) {
    console.error('Unlock customer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const resetDevice = async (req, res) => {
  try {
    const customer = await User.findByIdAndUpdate(
      req.params.id,
      { $unset: { device: 1 } },
      { new: true }
    ).select('-password');

    res.json({ message: 'Device reset', customer });
  } catch (error) {
    console.error('Reset device error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Customer deleted' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getSettings = async (req, res) => {
  try {
    const settings = await Settings.find();
    const settingsObj = settings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {
      trialDays: 30,
      freeInvoiceLimit: 10,
      whatsappNumber: '923082434421',
      maintenanceMode: false,
      allowRegistration: true,
    });

    res.json(settingsObj);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateSettings = async (req, res) => {
  try {
    const updates = req.body;

    for (const [key, value] of Object.entries(updates)) {
      await Settings.findOneAndUpdate(
        { key },
        { key, value },
        { upsert: true, new: true }
      );
    }

    res.json({ message: 'Settings updated' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getInvoices = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const total = await Invoice.countDocuments();
    const invoices = await Invoice.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      data: invoices,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getReports = async (req, res) => {
  try {
    const { type } = req.query;
    let startDate = new Date();

    switch (type) {
      case 'daily':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'yearly':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    const invoices = await Invoice.countDocuments({ issueDate: { $gte: startDate } });
    const revenueResult = await Invoice.aggregate([
      { $match: { issueDate: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    const newCustomers = await User.countDocuments({
      role: 'customer',
      createdAt: { $gte: startDate },
    });

    res.json({
      invoices,
      revenue: revenueResult[0]?.total || 0,
      newCustomers,
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getStats,
  getCustomers,
  getCustomerById,
  lockCustomer,
  unlockCustomer,
  resetDevice,
  deleteCustomer,
  getSettings,
  updateSettings,
  getInvoices,
  getReports,
};
