const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

router.use(auth, adminOnly);

router.get('/stats', adminController.getStats);
router.get('/customers', adminController.getCustomers);
router.get('/customers/:id', adminController.getCustomerById);
router.post('/customers/:id/lock', adminController.lockCustomer);
router.post('/customers/:id/unlock', adminController.unlockCustomer);
router.post('/customers/:id/reset-device', adminController.resetDevice);
router.delete('/customers/:id', adminController.deleteCustomer);
router.get('/invoices', adminController.getInvoices);
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);
router.get('/reports', adminController.getReports);

module.exports = router;
