import { z } from "zod";
import { getGeminiModel } from "../lib/gemini";

/* -------------------- SCHEMAS -------------------- */

export const BloodDataSchemaBase = z.object({
  hgb: z.number().optional(),
  wbc: z.number().optional(),
  rbc: z.number().optional(),
  plt: z.number().optional(),
  glucose: z.number().optional(),
  cholesterol: z.number().optional(),
});

export const BloodDataSchemaForPlan = BloodDataSchemaBase.refine(
  (data) => Object.values(data).some((v) => v !== undefined),
  { message: "At least one blood metric is required." }
);

export type BloodData = z.infer<typeof BloodDataSchemaBase>;

export const DietPlanSchema = z.object({
  overview: z.string(),
  recommendations: z.array(z.string()),
  foods_to_focus: z.array(z.string()),
  foods_to_limit: z.array(z.string()),
  hydration: z.string(),
  meal_plan: z.array(
    z.object({
      day: z.string(),
      meals: z.object({
        breakfast: z.string(),
        lunch: z.string(),
        dinner: z.string(),
        snacks: z.array(z.string()),
      }),
    })
  ),
});

export type DietPlan = z.infer<typeof DietPlanSchema>;

/* -------------------- HELPERS -------------------- */

const extractJson = (text: string): string => {
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("Gemini response does not contain valid JSON");
  }
  return text.slice(firstBrace, lastBrace + 1);
};

/* -------------------- MAIN SERVICE -------------------- */

export const generateDietPlan = async (
  bloodData: BloodData
): Promise<DietPlan> => {
  const model = getGeminiModel(); // ✅ TEK DOĞRU YERDEN ALIYORUZ

  const prompt = `
You are a clinical nutrition assistant.

Generate a safe, evidence-based diet plan based on the following blood test data.

Return ONLY valid JSON that matches this schema:
${JSON.stringify(DietPlanSchema.shape, null, 2)}

Blood data:
${JSON.stringify(bloodData)}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const jsonText = extractJson(text);
  const parsed = JSON.parse(jsonText);

  return DietPlanSchema.parse(parsed);
};
