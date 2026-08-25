import { Router } from 'express';
import { runSeed } from '../seed/seed.js';

const router = Router();

router.post('/', async (_req, res) => {
  try {
    await runSeed();
    res.json({ message: 'Catalog successfully seeded with Addendum A demo products!' });
  } catch (err: any) {
    console.error('[SeedRoute] Error seeding database:', err);
    res.status(500).json({ error: err.message || 'Failed to seed database' });
  }
});

export default router;
