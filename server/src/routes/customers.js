const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const customerController = require('../controllers/customerController');

router.get('/', auth, customerController.getAll);
router.get('/search', auth, customerController.search);
router.get('/:id', auth, customerController.getById);
router.post('/', auth, customerController.create);
router.put('/:id', auth, customerController.update);
router.delete('/:id', auth, customerController.remove);

module.exports = router;
