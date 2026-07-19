import { z } from "zod";

const likertValue = z.union([z.literal("na"), z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]);

export const surveySubmitSchema = z.object({
  runId: z.string().min(1),
  teamId: z.string().min(1),
  answers: z.record(z.string(), z.union([likertValue, z.string(), z.number(), z.array(z.string())])),
  openText: z.record(z.string(), z.string()).optional(),
});

export const surveyRunCreateSchema = z.object({
  formId: z.string().min(1),
  label: z.string().optional(),
  openDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  closeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  rotatingQuestionCode: z.enum(["Q4", "Q6", "Q7"]).optional(),
});

export const surveyRunStatusSchema = z.object({
  runId: z.string().min(1),
  status: z.enum(["draft", "open", "closed"]),
});
