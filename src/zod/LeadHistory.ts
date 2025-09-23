import { z } from "zod";

export const EditLeadHistorySchema = z.object({
  status: z.string().min(1, "El estado es requerido"),
  changedAt: z
    .string()
    .min(1, "La fecha y hora son requeridas")
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, "La fecha y hora deben ser válidas"),
});

export type EditLeadHistoryFormData = z.infer<typeof EditLeadHistorySchema>;