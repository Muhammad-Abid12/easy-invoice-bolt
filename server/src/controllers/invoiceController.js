const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
const User = require('../models/User');

const generateInvoiceNumber = async () => {
  const count = await Invoice.countDocuments();
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  return `INV-${year}${month}-${String(count + 1).padStart(5, '0')}`;
};

const getAll = async (req, res) => {
  try {
    const { search, status, startDate, endDate, customerId, page = 1, limit = 20 } = req.query;
    const query = { userId: req.user.id };

    if (status) query.status = status;
    if (customerId) query.customerId = customerId;

    if (startDate || endDate) {
      query.issueDate = {};
      if (startDate) query.issueDate.$gte = new Date(startDate);
      if (endDate) query.issueDate.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Invoice.countDocuments(query);
    const invoices = await Invoice.find(query)
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

const getById = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const create = async (req, res) => {
  try {
    const { customerId, items, discountAmount, shippingAmount, notes, termsAndConditions, dueDate } = req.body;

    // Check trial limits
    const user = await User.findById(req.user.id);
    if (user.role === 'customer') {
      if (user.invoiceCount >= user.maxInvoices || new Date() > user.trialEndDate) {
        return res.status(403).json({ message: 'Trial limit reached' });
      }
    }

    const customer = await Customer.findOne({ _id: customerId, userId: req.user.id });
    if (!customer) {
      return res.status(400).json({ message: 'Customer not found' });
    }

    const invoiceNumber = await generateInvoiceNumber();

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = items.reduce((sum, item) => sum + (item.total * item.tax / 100), 0);
    const total = subtotal + taxAmount - (discountAmount || 0) + (shippingAmount || 0);

    const invoice = new Invoice({
      userId: req.user.id,
      customerId,
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        company: customer.company,
      },
      invoiceNumber,
      items,
      subtotal,
      taxAmount,
      discountAmount: discountAmount || 0,
      shippingAmount: shippingAmount || 0,
      total,
      dueDate: new Date(dueDate),
      notes,
      termsAndConditions,
    });

    await invoice.save();

    // Update user invoice count
    user.invoiceCount += 1;
    await user.save();

    res.status(201).json(invoice);
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const update = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: req.body },
      { new: true }
    );

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    invoice.status = status;
    await invoice.save();

    res.json(invoice);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const remove = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json({ message: 'Invoice deleted' });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const todayInvoices = await Invoice.aggregate([
      { $match: { userId: req.user.id, issueDate: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    const monthInvoices = await Invoice.aggregate([
      { $match: { userId: req.user.id, issueDate: { $gte: firstDayOfMonth } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    const invoiceStats = await Invoice.aggregate([
      { $match: { userId: req.user.id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = {
      todaySales: todayInvoices[0]?.total || 0,
      monthlySales: monthInvoices[0]?.total || 0,
      totalInvoices: await Invoice.countDocuments({ userId: req.user.id }),
      paidInvoices: invoiceStats.find(s => s._id === 'paid')?.count || 0,
      pendingInvoices: invoiceStats.find(s => s._id === 'sent')?.count || 0,
      overdueInvoices: invoiceStats.find(s => s._id === 'overdue')?.count || 0,
    };

    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getNextNumber = async (req, res) => {
  try {
    const invoiceNumber = await generateInvoiceNumber();
    res.json({ invoiceNumber });
  } catch (error) {
    console.error('Get next number error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  updateStatus,
  remove,
  getStats,
  getNextNumber,
};
