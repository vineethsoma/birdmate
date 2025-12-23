import { Router, Request, Response, NextFunction } from 'express';
import { BirdService } from '../../services/BirdService.js';

const router = Router();
const birdService = new BirdService();

/**
 * GET /api/v1/birds/:id
 * Get bird details by ID
 */
router.get('/v1/birds/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_ID',
          message: 'Bird ID must be a number',
        },
      });
    }

    const result = await birdService.getBirdById(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/birds
 * Get all birds (paginated)
 */
router.get('/v1/birds', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string || '50', 10);
    const offset = parseInt(req.query.offset as string || '0', 10);

    const birds = await birdService.getAllBirds(limit, offset);
    res.json({ birds, limit, offset });
  } catch (error) {
    next(error);
  }
});

export default router;
