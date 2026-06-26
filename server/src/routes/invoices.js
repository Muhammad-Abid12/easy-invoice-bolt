const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const invoiceController = require('../controllers/invoiceController');

router.get('/', auth, invoiceController.getAll);
router.get('/stats', auth, invoiceController.getStats);
router.get('/next-number', auth, invoiceController.getNextNumber);
router.get('/:id', auth, invoiceController.getById);
router.post('/', auth, invoiceController.create);
router.put('/:id', auth, invoiceController.update);
router.patch('/:id/status', auth, invoiceController.updateStatus);
router.delete('/:id', auth, invoiceController.remove);

module.exports = router;
