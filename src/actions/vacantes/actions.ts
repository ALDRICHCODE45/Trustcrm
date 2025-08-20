"use server";
import { VacancyWithRelations } from "@/app/(dashboard)/reclutador/components/ReclutadorColumns";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import {
  VacancyTipo,
  VacancyEstado,
  VacancyPrioridad,
  User,
  Role,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import * as z from "zod";

//Schema para actualizar vacante optimizado
const updateVacancySchema = z.object({
  id: z.string().min(1, "ID de vacante es requerido"),
  tipo: z
    .enum([VacancyTipo.Nueva, VacancyTipo.Garantia, VacancyTipo.Recompra])
    .optional(),
  estado: z
    .enum([
      VacancyEstado.Hunting,
      VacancyEstado.Cancelada,
      VacancyEstado.Entrevistas,
      VacancyEstado.Perdida,
      VacancyEstado.PrePlacement,
      VacancyEstado.QuickMeeting,
      VacancyEstado.Placement,
    ])
    .optional(),
  posicion: z.string().min(1, "Posición es requerida").optional(),
  prioridad: z
    .enum([
      VacancyPrioridad.Alta,
      VacancyPrioridad.Normal,
      VacancyPrioridad.Baja,
    ])
    .optional(),
  fechaAsignacion: z.date().optional(),
  fechaEntrega: z.date().optional(),
  salario: z
    .number()
    .min(0, "El salario debe ser mayor o igual a 0")
    .optional(),
  valorFactura: z
    .number()
    .min(0, "El valor de factura debe ser mayor o igual a 0")
    .optional(),
  fee: z.number().min(0, "El fee debe ser mayor o igual a 0").optional(),
  monto: z.number().min(0, "El monto debe ser mayor o igual a 0").optional(),
  prestaciones: z.string().optional(),
  herramientas: z.string().optional(),
  comisiones: z.string().optional(),
  modalidad: z.string().optional(),
  horario: z.string().optional(),
  psicometria: z.string().optional(),
  ubicacion: z.string().optional(),
  comentarios: z.string().optional(),
});

type UpdateVacancyFormData = z.infer<typeof updateVacancySchema>;

interface VacancyFormData {
  tipo?: VacancyTipo;
  estado?: VacancyEstado;
  posicion?: string;
  prioridad?: VacancyPrioridad;
  fechaAsignacion?: Date;
  fechaEntrega?: Date;
  reclutadorId?: string;
  clienteId: string; // Hacer requerido según el esquema
  salario?: number;
  valorFactura?: number;
  fee?: number;
  monto?: number;
  //Detalles de la vacante
  prestaciones?: string;
  herramientas?: string;
  comisiones?: string;
  modalidad?: string;
  horario?: string;
  psicometria?: string;
  ubicacion?: string;
  comentarios?: string;
  // Requisitos del checklist
  requisitos?: string[];
}

export const updateVacancy = async (data: UpdateVacancyFormData) => {
  try {
    // Validar los datos con Zod
    const validatedData = updateVacancySchema.parse(data);

    // Extraer el ID y preparar datos de actualización
    const { id, ...updateData } = validatedData;

    // Filtrar campos undefined para evitar sobrescribir con null
    const filteredUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    // Verificar que hay al menos un campo para actualizar
    if (Object.keys(filteredUpdateData).length === 0) {
      return {
        ok: false,
        message: "No hay campos para actualizar",
      };
    }

    const updatedVacancy = await prisma.vacancy.update({
      where: { id },
      data: {
        ...filteredUpdateData,
        prestaciones: data.prestaciones || undefined,
        herramientas: data.herramientas || undefined,
        comisiones: data.comisiones || undefined,
        modalidad: data.modalidad || undefined,
        horario: data.horario || undefined,
        psicometria: data.psicometria || undefined,
        ubicacion: data.ubicacion || undefined,
        comentarios: data.comentarios || undefined,
      },
      include: {
        reclutador: true,
        cliente: true,
        candidatoContratado: true,
        ternaFinal: true,
        Comments: {
          include: {
            author: true,
          },
        },
      },
    });

    // Revalidar las rutas para actualizar la UI
    revalidatePath("/list/reclutamiento");
    revalidatePath("/reclutador");
    revalidatePath("/");

    return {
      ok: true,
      message: "Vacante actualizada correctamente",
      vacancy: updatedVacancy,
    };
  } catch (error) {
    console.error("Error al actualizar la vacante:", error);

    // Manejar errores de validación de Zod
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((err) => err.message).join(", ");
      return {
        ok: false,
        message: `Error de validación: ${errorMessages}`,
      };
    }

    // Manejar error de registro no encontrado
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return {
        ok: false,
        message: "Vacante no encontrada",
      };
    }

    // Manejar otros errores
    return {
      ok: false,
      message: "Error al actualizar la vacante",
    };
  }
};

export const createVacancy = async (vacancy: VacancyFormData) => {
  try {
    if (!vacancy.reclutadorId) {
      return {
        ok: false,
        message: "El reclutador es requerido",
      };
    }

    if (!vacancy.clienteId) {
      return {
        ok: false,
        message: "El cliente es requerido",
      };
    }

    if (!vacancy.fechaAsignacion) {
      return {
        ok: false,
        message: "La fecha de asignación es requerida",
      };
    }

    if (!vacancy.posicion) {
      return {
        ok: false,
        message: "La posición es requerida",
      };
    }

    const newVacancy = await prisma.vacancy.create({
      data: {
        fechaAsignacion: vacancy.fechaAsignacion,
        posicion: vacancy.posicion,
        tipo: vacancy.tipo || "Nueva",
        estado: vacancy.estado || "Hunting",
        prioridad: vacancy.prioridad || "Alta",
        fechaEntrega: vacancy.fechaEntrega,
        salario: vacancy.salario,
        valorFactura: vacancy.valorFactura,
        fee: vacancy.fee,
        monto: vacancy.monto,
        reclutador: {
          connect: {
            id: vacancy.reclutadorId,
          },
        },
        cliente: {
          connect: {
            id: vacancy.clienteId,
          },
        },
        prestaciones: vacancy.prestaciones,
        herramientas: vacancy.herramientas,
        comisiones: vacancy.comisiones,
        modalidad: vacancy.modalidad,
        horario: vacancy.horario,
        psicometria: vacancy.psicometria,
        ubicacion: vacancy.ubicacion,
        comentarios: vacancy.comentarios,
      },
    });

    // Crear los requisitos del checklist si se proporcionaron
    if (vacancy.requisitos && vacancy.requisitos.length > 0) {
      const requisitosLimpios = vacancy.requisitos
        .map((req) => req.trim())
        .filter((req) => req.length > 0);

      for (const content of requisitosLimpios) {
        await prisma.inputChecklist.create({
          data: {
            content,
            vacancyId: newVacancy.id,
          },
        });
      }
    }

    revalidatePath("/list/reclutamiento");
    revalidatePath("/reclutador");
    revalidatePath("/");
    return {
      ok: true,
      message: "Vacante creada correctamente",
      vacancy: newVacancy,
    };
  } catch (err) {
    console.log(err);
    throw new Error("Error al crear la vacante");
  }
};

export const updateVacancyStatus = async (
  vacancyId: string,
  status: VacancyEstado
) => {
  try {
    // Primero obtener la vacante con todas sus relaciones para validar
    const currentVacancy = await prisma.vacancy.findUnique({
      where: { id: vacancyId },
      include: {
        InputChecklist: {
          include: {
            InputChecklistFeedback: {
              include: {
                candidate: true,
              },
            },
          },
        },
        Comments: {
          include: {
            author: true,
          },
        },
        candidatoContratado: {
          include: {
            cv: true,
            vacanciesContratado: true,
          },
        },
        reclutador: true,
        cliente: true,
        ternaFinal: {
          include: {
            cv: true,
            vacanciesContratado: true,
          },
        },
        files: true,
      },
    });

    if (!currentVacancy) {
      return {
        ok: false,
        message: "Vacante no encontrada",
      };
    }

    // Importar y usar las validaciones
    const { validateStateTransition } = await import(
      "@/lib/vacancyStateValidations"
    );

    // Validar la transición de estado
    const validationResult = validateStateTransition(currentVacancy, status);

    if (!validationResult.isValid) {
      return {
        ok: false,
        message:
          validationResult.message ||
          "No se puede cambiar al estado solicitado",
        reason: validationResult.reason,
      };
    }

    // Si la validación es exitosa, actualizar el estado
    const vacancy = await prisma.vacancy.update({
      where: { id: vacancyId },
      data: { estado: status },
    });

    revalidatePath("/list/reclutamiento");
    revalidatePath("/reclutador");
    revalidatePath("/");

    return { ok: true, message: "Vacante actualizada correctamente", vacancy };
  } catch (err) {
    console.error("Error al actualizar el estado de la vacante:", err);
    return {
      ok: false,
      message: "Error al actualizar el estado de la vacante",
    };
  }
};

export const getRecruiters = async (): Promise<User[]> => {
  try {
    const recruiters = await prisma.user.findMany({
      where: {
        role: {
          in: [Role.reclutador],
        },
      },
    });
    return recruiters;
  } catch (error) {
    console.log(error);
    throw Error("error");
  }
};

export const deleteVacancy = async (vacancyId: string) => {
  try {
    const vacancy = await prisma.vacancy.delete({
      where: { id: vacancyId },
    });

    revalidatePath("/list/reclutamiento");
    revalidatePath("/reclutador");
    revalidatePath("/");

    return { ok: true, message: "Vacante eliminada correctamente", vacancy };
  } catch (err) {
    console.log(err);
    return {
      ok: false,
      message: "Error al eliminar la vacante",
    };
  }
};

export const deseleccionarCandidato = async (vacancyId: string) => {
  try {
    const vacancy = await prisma.vacancy.update({
      where: { id: vacancyId },
      data: { candidatoContratadoId: null },
    });

    if (!vacancy) {
      return {
        ok: false,
        message: "La vacante no existe",
      };
    }

    revalidatePath("/reclutador");
    revalidatePath("/reclutador/kanban");

    return { ok: true, message: "Candidato deseleccionado", vacancy };
  } catch (err) {
    return {
      ok: false,
      message: "Ha ocurrido un error inesperado al deseleccionar al candidato",
    };
  }
};

export const seleccionarCandidato = async (
  candidateId: string,
  vacancyId: string
) => {
  try {
    const candidateExists = await prisma.person.findUnique({
      where: {
        id: candidateId,
      },
    });
    if (!candidateExists) {
      return {
        ok: false,
        message: "El candidato no existe",
      };
    }

    if (
      !candidateExists.cvFileId ||
      !candidateExists.email ||
      !candidateExists.name ||
      !candidateExists.phone
    ) {
      return {
        ok: false,
        message:
          "Los datos del candidato deben llenarse completamente para poder seleccionarlo",
      };
    }

    const findVacancyById = await prisma.vacancy.findUnique({
      where: {
        id: vacancyId,
      },
    });
    if (!findVacancyById) {
      return {
        ok: false,
        message: "La vacante no existe.. contacte con soporte",
      };
    }

    await prisma.vacancy.update({
      where: {
        id: vacancyId,
      },
      data: {
        candidatoContratadoId: candidateExists.id,
      },
    });

    revalidatePath("/reclutador");
    revalidatePath("/reclutador/kanban");

    return {
      ok: true,
      message: "Candidato seleccionado",
    };
  } catch (err) {
    return {
      ok: false,
      message: "Ha ocurrido un error inesperado",
    };
  }
};

export const getCandidates = async ({ vacancyId }: { vacancyId: string }) => {
  try {
    const candidates = await prisma.person.findMany({
      where: {
        vacanciesTernaFinal: {
          some: {
            id: vacancyId,
          },
        },
      },

      include: {
        cv: true,
        vacanciesContratado: true,
      },
    });
    return {
      ok: true,
      message: "Candidatos obtenidos correctamente",
      candidates,
    };
  } catch (error) {
    console.log(error);
    return {
      ok: false,
      message: "Error al obtener candidatos de la vacante",
    };
  }
};

export const getVacancyDetails = async (vacancyId: string) => {
  try {
    const vacancy = await prisma.vacancy.findUnique({
      where: { id: vacancyId },
      include: {
        InputChecklist: {
          include: {
            InputChecklistFeedback: {
              include: {
                candidate: true,
              },
            },
          },
        },
        reclutador: true,
        cliente: true,
        candidatoContratado: {
          include: {
            cv: true,
            vacanciesContratado: true,
          },
        },
        ternaFinal: {
          include: {
            cv: true,
            vacanciesContratado: true,
          },
        },
        files: true,
        Comments: {
          include: {
            author: true,
          },
        },
      },
    });
    if (!vacancy) {
      return {
        ok: false,
        message: "La vacante no existe",
        vacancy: null,
      };
    }
    return {
      ok: true,
      message: "Vacante obtenida correctamente",
      vacancy,
    };
  } catch (error) {
    console.log(error);
    return {
      ok: false,
      message: "Error al obtener la vacante",
      vacancy: null,
    };
  }
};

export const getVacancies = async (): Promise<{
  ok: boolean;
  message: string;
  vacancies: VacancyWithRelations[];
}> => {
  try {
    const vacancies = await prisma.vacancy.findMany({
      include: {
        InputChecklist: {
          include: {
            InputChecklistFeedback: {
              include: {
                candidate: true,
              },
            },
          },
        },
        reclutador: true,
        cliente: true,
        candidatoContratado: {
          include: {
            cv: true,
            vacanciesContratado: true,
          },
        },
        ternaFinal: {
          include: {
            cv: true,
            vacanciesContratado: true,
          },
        },
        files: true,
        Comments: {
          include: {
            author: true,
          },
        },
      },
      orderBy: {
        fechaAsignacion: "desc",
      },
    });
    return {
      ok: true,
      message: "Vacantes obtenidas correctamente",
      vacancies,
    };
  } catch (error) {
    return {
      ok: false,
      message: "Error al obtener las vacantes",
      vacancies: [],
    };
  }
};

export const validateCandidateAction = async (candidateId: string) => {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    //actualizar el candidato para hacer entrevistas
    await prisma.person.update({
      where: { id: candidateId },
      data: { IsCandidateValidated: true },
    });

    revalidatePath("/reclutador");
    revalidatePath("/reclutador/kanban");

    return {
      ok: true,
      message: "Candidato validado correctamente",
    };
  } catch (e) {
    return {
      ok: false,
      message: "Error al validar el candidato",
    };
  }
};
