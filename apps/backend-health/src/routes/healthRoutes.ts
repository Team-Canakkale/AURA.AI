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

export default router;
