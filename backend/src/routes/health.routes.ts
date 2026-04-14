import { Router } from 'express';
import { sendSuccess } from '../core/http/response';

const router = Router();

router.get('/', (req, res) => {
  sendSuccess(
    res,
    {
      status: 'ok'
    },
    {
      requestId: req.requestId ?? 'unknown',
      generatedAt: new Date().toISOString()
    }
  );
});

export { router as healthRouter };
