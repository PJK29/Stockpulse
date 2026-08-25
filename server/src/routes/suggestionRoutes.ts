import { Router } from 'express';
import { suggestionController } from '../controllers/suggestionController.js';

export const pricingRouter = Router();
pricingRouter.get('/', (req, res) => suggestionController.getPricingSuggestions(req, res));
pricingRouter.patch('/:id', (req, res) => suggestionController.resolvePricingSuggestion(req, res));

export const reorderRouter = Router();
reorderRouter.get('/', (req, res) => suggestionController.getReorderSuggestions(req, res));
reorderRouter.patch('/:id', (req, res) => suggestionController.resolveReorderSuggestion(req, res));
