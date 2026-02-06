import type { Request, Response } from 'express';
import pdfParse from 'pdf-parse';
import { ZodError } from 'zod';
import { extractBloodMetrics } from '../services/bloodParser';
import { BloodDataSchemaBase, BloodDataSchemaForPlan, generateDietPlan } from '../services/gemini';
import { ocrPdfToText } from '../services/ocr';

const handleError = (res: Response, error: unknown) => {
    if (error instanceof ZodError) {
        return res.status(422).json({ success: false, error: error.flatten() });
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ success: false, error: message });
};

export const parseBloodPdf = async (req: Request, res: Response) => {
    try {
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ success: false, error: 'PDF file is required.' });
        }

        const parsed = await pdfParse(req.file.buffer);
        let text = parsed.text || '';
        if (text.trim().length < 10) {
            text = await ocrPdfToText(req.file.buffer);
        }
        const metrics = extractBloodMetrics(text);
        const validated = BloodDataSchemaBase.parse(metrics);
        const hasAnyMetric = Object.values(validated).some((v) => v !== undefined);
        if (!hasAnyMetric) {
            return res.status(422).json({
                success: false,
                error: 'No blood metrics found in PDF.',
                details: 'Parsed text was empty or contained no recognizable metric labels.'
            });
        }

        return res.json({ success: true, data: validated });
    } catch (error: unknown) {
        return handleError(res, error);
    }
};

export const generateDietPlanHandler = async (req: Request, res: Response) => {
    try {
        const validated = BloodDataSchemaForPlan.parse(req.body);
        const plan = await generateDietPlan(validated);
        return res.json({ success: true, data: plan });
    } catch (error: unknown) {
        return handleError(res, error);
    }
};
