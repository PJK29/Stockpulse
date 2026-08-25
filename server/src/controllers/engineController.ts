import { Request, Response } from 'express';
import { commerceEngine } from '../engine/commerceEngine.js';
import { StrategyType } from '../domain/types.js';

export class EngineController {
  public async getEngineStatus(_req: Request, res: Response): Promise<void> {
    try {
      const activeStrategy = commerceEngine.getActiveStrategy();
      const availableStrategies = commerceEngine.getAvailableStrategies();

      res.json({
        activeStrategy,
        availableStrategies,
        geminiApiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
      });
    } catch (err: any) {
      console.error('[EngineController.getEngineStatus] Error:', err);
      res.status(500).json({ error: err.message || 'Failed to get engine status' });
    }
  }

  public async setStrategy(req: Request, res: Response): Promise<void> {
    try {
      const { strategy } = req.body;

      if (!strategy || (strategy !== StrategyType.RULE_BASED && strategy !== StrategyType.AI_GEMINI)) {
        res.status(400).json({ error: "Invalid strategy. Must be 'RULE_BASED' or 'AI_GEMINI'." });
        return;
      }

      const activeStrategy = await commerceEngine.setActiveStrategy(strategy as StrategyType);
      res.json({
        message: `Successfully switched commerce strategy to ${activeStrategy}`,
        activeStrategy,
      });
    } catch (err: any) {
      console.error('[EngineController.setStrategy] Error:', err);
      res.status(400).json({ error: err.message || 'Failed to switch strategy' });
    }
  }
}

export const engineController = new EngineController();
