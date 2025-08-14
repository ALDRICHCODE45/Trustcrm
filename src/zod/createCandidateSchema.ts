import { z } from "zod";

export const createCandidateSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").trim(),
  phone: z.string().optional().or(z.literal("")),
  email: z
    .string()
    .email("Correo electrónico inválido")
    .optional()
    .or(z.literal("")),
  cvFile: z.any().optional(), // El archivo real del CV que se subirá
  esta_empleado: z.boolean().optional().or(z.literal("")),
  sueldo_actual_o_ultimo: z.string().optional().or(z.literal("")),
  prestaciones_actuales_o_ultimas: z.string().optional().or(z.literal("")),
  bonos_comisiones: z.string().optional().or(z.literal("")),
  otros_beneficios: z.string().optional().or(z.literal("")),
  expectativa_económica: z.string().optional().or(z.literal("")),
  direccion_actual: z.string().optional().or(z.literal("")),
  modalidad_actual_o_ultima: z.string().optional().or(z.literal("")),
  ubicacion_ultimo_trabajo: z.string().optional().or(z.literal("")),
});

export type CreateCandidateFormData = z.infer<typeof createCandidateSchema>;
