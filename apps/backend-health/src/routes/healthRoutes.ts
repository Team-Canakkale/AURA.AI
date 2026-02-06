import { Router } from 'express';
import multer from 'multer';
import { generateDietPlanHandler, parseBloodPdf } from '../controllers/healthController';

const router = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});

router.post('/api/health/parse-blood', upload.single('file'), parseBloodPdf);
router.post('/api/health/diet-plan', generateDietPlanHandler);
router.get('/api/health/health', (_req, res) => {
    res.json({ status: 'ok', service: 'health', timestamp: new Date().toISOString() });
});

export default router;
