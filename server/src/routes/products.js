const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const productController = require('../controllers/productController');

router.get('/', auth, productController.getAll);
router.get('/search', auth, productController.getAll);
router.get('/categories', auth, productController.getCategories);
router.get('/:id', auth, productController.getById);
router.post('/', auth, productController.create);
router.put('/:id', auth, productController.update);
router.delete('/:id', auth, productController.remove);

module.exports = router;
