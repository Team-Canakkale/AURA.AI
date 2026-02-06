export type ParsedBloodData = {
    hgb?: number;
    wbc?: number;
    rbc?: number;
    plt?: number;
    glucose?: number;
    cholesterol?: number;
};

const parseNumber = (value: string): number | undefined => {
    const cleaned = value.replace(/[,]/g, '').trim();
    const num = Number.parseFloat(cleaned);
    return Number.isFinite(num) ? num : undefined;
};

const extractMetric = (text: string, patterns: RegExp[]): number | undefined => {
    for (const regex of patterns) {
        const match = text.match(regex);
        if (match && match[1]) {
            const num = parseNumber(match[1]);
            if (num !== undefined) return num;
        }
    }
    return undefined;
};

export const extractBloodMetrics = (text: string): ParsedBloodData => {
    const normalized = text.replace(/\s+/g, ' ');

    const hgb = extractMetric(normalized, [
        /\bHGB\b[^0-9]*([0-9]+(?:\.[0-9]+)?)/i,
        /\bHemoglobin\b[^0-9]*([0-9]+(?:\.[0-9]+)?)/i
    ]);

    const wbc = extractMetric(normalized, [
        /\bWBC\b[^0-9]*([0-9]+(?:\.[0-9]+)?)/i,
        /\bWhite Blood Cell(?:s)?\b[^0-9]*([0-9]+(?:\.[0-9]+)?)/i,
        /\bLeukocytes\b[^0-9]*([0-9]+(?:\.[0-9]+)?)/i
    ]);

    const rbc = extractMetric(normalized, [
        /\bRBC\b[^0-9]*([0-9]+(?:\.[0-9]+)?)/i,
        /\bRed Blood Cell(?:s)?\b[^0-9]*([0-9]+(?:\.[0-9]+)?)/i
    ]);

    const plt = extractMetric(normalized, [
        /\bPLT\b[^0-9]*([0-9]+(?:\.[0-9]+)?)/i,
        /\bPlatelet(?:s)?\b[^0-9]*([0-9]+(?:\.[0-9]+)?)/i
    ]);

    const glucose = extractMetric(normalized, [
        /\bGlucose\b[^0-9]*([0-9]+(?:\.[0-9]+)?)/i,
        /\bGLU\b[^0-9]*([0-9]+(?:\.[0-9]+)?)/i
    ]);

    const cholesterol = extractMetric(normalized, [
        /\bCholesterol\b[^0-9]*([0-9]+(?:\.[0-9]+)?)/i,
        /\bTotal Cholesterol\b[^0-9]*([0-9]+(?:\.[0-9]+)?)/i,
        /\bCHOL\b[^0-9]*([0-9]+(?:\.[0-9]+)?)/i
    ]);

    return { hgb, wbc, rbc, plt, glucose, cholesterol };
};
