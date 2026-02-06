import { createCanvas } from '@napi-rs/canvas';
import { createWorker } from 'tesseract.js';

export const ocrPdfToText = async (pdfBuffer: Buffer, maxPages: number = 3): Promise<string> => {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const data = pdfBuffer instanceof Uint8Array ? pdfBuffer : new Uint8Array(pdfBuffer);
    const loadingTask = pdfjsLib.getDocument({ data });
    const pdf = await loadingTask.promise;

    const totalPages = Math.min(pdf.numPages, maxPages);
    const worker = await createWorker('eng');
    let combinedText = '';

    try {
        for (let pageNum = 1; pageNum <= totalPages; pageNum += 1) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 2.0 });
            const canvas = createCanvas(viewport.width, viewport.height);
            const context = canvas.getContext('2d');

            await page.render({ canvasContext: context as any, viewport }).promise;

            const imageBuffer = canvas.toBuffer('image/png');
            const { data } = await worker.recognize(imageBuffer);
            combinedText += `\n${data.text}`;
        }
    } finally {
        await worker.terminate();
    }

    return combinedText.trim();
};
