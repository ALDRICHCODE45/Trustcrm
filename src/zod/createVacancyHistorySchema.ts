import { z } from "zod";
import { VacancyEstado } from "@prisma/client";

export const createVacancyHistorySchema = z.object({
  status: z.nativeEnum(VacancyEstado, {
    errorMap: () => ({ message: "Selecciona un estado válido" }),
  }),
  changedAt: z
    .string()
    .min(1, "La fecha y hora son requeridas")
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, "La fecha y hora deben ser válidas"),
  vacanteId: z.string().min(1, "ID de vacante requerido"),
});

export type CreateVacancyHistoryFormData = z.infer<
  typeof createVacancyHistorySchema
>;
