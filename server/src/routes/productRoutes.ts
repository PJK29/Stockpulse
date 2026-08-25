import { Router } from 'express';
import { productController } from '../controllers/productController.js';
import { suggestionController } from '../controllers/suggestionController.js';

const router = Router();

router.post('/', (req, res) => productController.createProduct(req, res));
router.get('/', (req, res) => productController.getProducts(req, res));
router.get('/:id', (req, res) => productController.getProductById(req, res));
router.patch('/:id/stock', (req, res) => productController.updateStock(req, res));
router.post('/:id/orders', (req, res) => productController.simulateOrder(req, res));
router.post('/:id/suggest-pricing', (req, res) => suggestionController.suggestPricing(req, res));
router.post('/:id/suggest-reorder', (req, res) => suggestionController.suggestReorder(req, res));

export default router;
