import { Request, Response } from 'express';
import { suggestionService } from '../services/suggestionService.js';
import { SuggestionStatus } from '../domain/types.js';

export class SuggestionController {
  public async getPricingSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const { status, productId } = req.query;
      const suggestions = await suggestionService.getPricingSuggestions({
        status: status as SuggestionStatus,
        productId: productId as string,
      });
      res.json(suggestions);
    } catch (err: any) {
      console.error('[SuggestionController.getPricingSuggestions] Error:', err);
      res.status(500).json({ error: err.message || 'Failed to retrieve pricing suggestions' });
    }
  }

  public async getReorderSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const { status, productId } = req.query;
      const suggestions = await suggestionService.getReorderSuggestions({
        status: status as SuggestionStatus,
        productId: productId as string,
      });
      res.json(suggestions);
    } catch (err: any) {
      console.error('[SuggestionController.getReorderSuggestions] Error:', err);
      res.status(500).json({ error: err.message || 'Failed to retrieve reorder suggestions' });
    }
  }

  public async resolvePricingSuggestion(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || (status !== SuggestionStatus.ACCEPTED && status !== SuggestionStatus.REJECTED)) {
        res.status(400).json({ error: "Invalid status. Must be 'ACCEPTED' or 'REJECTED'." });
        return;
      }

      const result = await suggestionService.resolvePricingSuggestion(id, status as SuggestionStatus);
      res.json(result);
    } catch (err: any) {
      console.error('[SuggestionController.resolvePricingSuggestion] Error:', err);
      res.status(400).json({ error: err.message || 'Failed to resolve pricing suggestion' });
    }
  }

  public async resolveReorderSuggestion(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || (status !== SuggestionStatus.ACCEPTED && status !== SuggestionStatus.REJECTED)) {
        res.status(400).json({ error: "Invalid status. Must be 'ACCEPTED' or 'REJECTED'." });
        return;
      }

      const result = await suggestionService.resolveReorderSuggestion(id, status as SuggestionStatus);
      res.json(result);
    } catch (err: any) {
      console.error('[SuggestionController.resolveReorderSuggestion] Error:', err);
      res.status(400).json({ error: err.message || 'Failed to resolve reorder suggestion' });
    }
  }

  public async suggestPricing(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await suggestionService.requestManualPricing(id);
      res.json(result);
    } catch (err: any) {
      console.error('[SuggestionController.suggestPricing] Error:', err);
      res.status(500).json({ error: err.message || 'Failed to trigger pricing suggestion' });
    }
  }

  public async suggestReorder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await suggestionService.requestManualReorder(id);
      res.json(result);
    } catch (err: any) {
      console.error('[SuggestionController.suggestReorder] Error:', err);
      res.status(500).json({ error: err.message || 'Failed to trigger reorder suggestion' });
    }
  }
}

export const suggestionController = new SuggestionController();
