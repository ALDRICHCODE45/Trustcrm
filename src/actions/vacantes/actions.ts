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
  TaskStatus,
} from "@prisma/client";
import { differenceInCalendarDays } from "date-fns";
import { revalidatePath } from "next/cache";
import * as z from "zod";
import { createTask } from "../tasks/actions";

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
      VacancyEstado.StandBy,
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
  salario: z.string().optional(),
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
  tiempoTranscurrido: z.number().optional(),
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
  salario?: string;
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
  // Nueva opción para notificaciones especiales
  enviarNotificacion?: boolean;
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

    //buscar la vacante a actualizar
    const vacancy = await prisma.vacancy.findUnique({
      where: { id },
    });

    //validar si viene un nuevo estado
    if (data.estado && vacancy?.estado !== data.estado) {
      const result = await updateVacancyStatus(id, data.estado);
      if (!result.ok) {
        return {
          ok: false,
          message: result.message,
          reason: result.reason,
        };
      }
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
        fee: data.fee || undefined,
        monto: data.monto || undefined,
        valorFactura: data.valorFactura || undefined,
        salario: data.salario || undefined,
        tiempoTranscurrido: data.tiempoTranscurrido,
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

const tasksOnCreationVacancy = [
  {
    title: "Subir Job description",
    description: "Subir el job description de la vacante",
  },
  {
    title: "Subir Perfil muestra",
    description: "Subir el perfil muestra de la vacante",
  },
  {
    title: "Realizar el checklist",
    description: "Realizar el checklist de la vacante",
  },
];

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

    const session = await auth();
    if (!session?.user) {
      return {
        ok: false,
        message: "No hay usuario logueado",
      };
    }

    const estadoInicial = vacancy.estado || "QuickMeeting";

    const newVacancy = await prisma.vacancy.create({
      data: {
        fechaAsignacion: vacancy.fechaAsignacion,
        posicion: vacancy.posicion,
        tipo: vacancy.tipo || "Nueva",
        estado: estadoInicial,
        prioridad: vacancy.prioridad || "Alta",
        fechaEntrega: vacancy.fechaEntrega,
        salario: vacancy.salario || undefined,
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
      include: {
        reclutador: true,
      },
    });

    // Crear el registro inicial en el historial de estados
    await prisma.vacancyStatusHistory.create({
      data: {
        vacancyId: newVacancy.id,
        status: estadoInicial,
        changedById: session.user.id,
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

    //si el estado es QuickMeeting, crear tres tareas: Subir Job description, Subir Perfil muestra y Realizar el checklist
    if (estadoInicial === VacancyEstado.QuickMeeting) {
      //obtener todos los administradores
      const admins = await prisma.user.findMany({
        where: {
          role: Role.Admin,
        },
      });

      const notificationRecipients = admins.map((admin) => admin.id);

      for (const task of tasksOnCreationVacancy) {
        const formData = new FormData();
        formData.append("title", task.title);
        formData.append("description", task.description);
        formData.append("userId", vacancy.reclutadorId);
        formData.append("status", TaskStatus.Pending);
        formData.append(
          "dueDate",
          new Date(new Date().setDate(new Date().getDate() + 1)).toISOString()
        );
        formData.append("vacancyId", newVacancy.id);

        // Agregar cada destinatario por separado en lugar de un string separado por comas
        notificationRecipients.forEach((recipientId) => {
          formData.append("notificationRecipients", recipientId);
        });

        formData.append("notifyOnComplete", "true");
        const tarea = await createTask(formData);
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

const calculateDaysFromAssignment = (fechaAsignacion: Date): number => {
  // Usar differenceInCalendarDays para días calendario reales
  const diffDays = differenceInCalendarDays(
    new Date(),
    new Date(fechaAsignacion)
  );
  return Math.max(0, diffDays); // Nunca menos de 0 días transcurridos
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
    //validar si el usuario es reclutador (en ese caso no puede cambiar a "Perdida" ni "Cancelada")
    const session = await auth();
    if (!session?.user) {
      return {
        ok: false,
        message: "No hay usuario logueado",
      };
    }

    if (session.user.role === Role.reclutador) {
      if (
        status === VacancyEstado.Perdida ||
        status === VacancyEstado.Cancelada
      ) {
        return {
          ok: false,
          message: "No puedes cambiar el estado a Perdida o Cancelada",
        };
      }
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

    // Registrar el cambio de estado en el historial
    await prisma.vacancyStatusHistory.create({
      data: {
        vacancyId: vacancyId,
        status: status,
        changedById: session.user.id,
      },
    });

    // si el estado es Placement, calcular el tiempo transcurrido
    if (status === VacancyEstado.Placement) {
      const daysTranscurred = calculateDaysFromAssignment(
        vacancy.fechaAsignacion
      );
      await prisma.vacancy.update({
        where: { id: vacancyId },
        data: { tiempoTranscurrido: daysTranscurred },
      });
    }

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

export const reassignRecruiter = async (
  vacancyId: string,
  newRecruiterId: string
) => {
  try {
    const vacancy = await prisma.vacancy.update({
      where: { id: vacancyId },
      data: { reclutadorId: newRecruiterId },
    });
  } catch (err) {
    console.log(err);
    return {
      ok: false,
      message: "Error al reasignar el reclutador",
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

export const unValidateCandidate = async (candidateId: string) => {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    //actualizar el candidato para desvalidarlo
    await prisma.person.update({
      where: { id: candidateId },
      data: { IsCandidateValidated: false },
    });

    revalidatePath("/reclutador");
    revalidatePath("/reclutador/kanban");

    return {
      ok: true,
      message: "Candidato desvalidado correctamente",
    };
  } catch (e) {
    return {
      ok: false,
      message: "Error al desvalidar el candidato",
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

export const validateTernaToVacancy = async (
  vacancyId: string,
  selectedCandidateIds: string[]
) => {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    // Validar que se hayan seleccionado candidatos
    if (!selectedCandidateIds || selectedCandidateIds.length === 0) {
      return {
        ok: false,
        message: "Debe seleccionar al menos un candidato para la terna",
      };
    }

    // Verificar que la vacante existe
    const vacancy = await prisma.vacancy.findUnique({
      where: { id: vacancyId },
    });

    if (!vacancy) {
      return {
        ok: false,
        message: "La vacante no existe",
      };
    }

    // Verificar que todos los candidatos existen y están relacionados con la vacante
    const candidates = await prisma.person.findMany({
      where: {
        id: { in: selectedCandidateIds },
        vacanciesTernaFinal: { some: { id: vacancyId } },
      },
    });

    if (candidates.length !== selectedCandidateIds.length) {
      return {
        ok: false,
        message:
          "Algunos candidatos seleccionados no son válidos o no están en la terna final",
      };
    }

    // Usar transacción para asegurar consistencia
    await prisma.$transaction(async (tx) => {
      // Actualizar la vacante para validar la terna
      await tx.vacancy.update({
        where: { id: vacancyId },
        data: { fechaEntregaTerna: new Date() },
      });

      // Crear entrada en el historial de terna
      const ternaHistory = await tx.ternaHistory.create({
        data: {
          vacancyId: vacancyId,
          validatedById: session.user.id,
          deliveredAt: new Date(),
        },
      });

      // Crear las relaciones con los candidatos seleccionados
      await tx.ternaHistoryCandidate.createMany({
        data: selectedCandidateIds.map((candidateId) => ({
          ternaHistoryId: ternaHistory.id,
          candidateId: candidateId,
        })),
      });
    });

    revalidatePath("/reclutador");
    revalidatePath("/reclutador/kanban");
    return {
      ok: true,
      message: "Terna validada correctamente",
    };
  } catch (e) {
    console.error("Error validating terna:", e);
    return {
      ok: false,
      message: "Error al validar la terna",
    };
  }
};

export const unvalidateTernaAction = async (vacancyId: string) => {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    // Verificar que la vacante existe
    const vacancy = await prisma.vacancy.findUnique({
      where: { id: vacancyId },
    });

    if (!vacancy) {
      return {
        ok: false,
        message: "La vacante no existe",
      };
    }

    // Usar transacción para asegurar consistencia
    await prisma.$transaction(async (tx) => {
      // Actualizar la vacante para desvalidar la terna
      await tx.vacancy.update({
        where: { id: vacancyId },
        data: { fechaEntregaTerna: null },
      });

      // Eliminar las entradas del historial de terna más reciente
      // Nota: Mantenemos el historial por auditoría, pero podríamos agregar un campo "isActive" si se requiere
      // Por ahora, solo actualizamos la fechaEntregaTerna a null
    });

    revalidatePath("/reclutador");
    revalidatePath("/reclutador/kanban");
    return {
      ok: true,
      message: "Terna desvalidada correctamente",
    };
  } catch (e) {
    console.error("Error unvalidating terna:", e);
    return {
      ok: false,
      message: "Error al desvalidar la terna",
    };
  }
};

// Función para obtener el historial de ternas de una vacante
export const getTernaHistory = async (vacancyId: string) => {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const ternaHistory = await prisma.ternaHistory.findMany({
      where: { vacancyId },
      include: {
        validatedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        candidates: {
          include: {
            candidate: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                position: true,
                cv: {
                  select: {
                    url: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { deliveredAt: "desc" },
    });

    return {
      ok: true,
      data: ternaHistory,
    };
  } catch (e) {
    console.error("Error getting terna history:", e);
    return {
      ok: false,
      message: "Error al obtener el historial de ternas",
      data: [],
    };
  }
};

interface Args {
  vacancyId: string;
  salarioFinal: string;
  fechaProximaEntrada: string;
}

export const updateSalarioFinalAndFechaProximaEntrada = async ({
  fechaProximaEntrada,
  salarioFinal,
  vacancyId,
}: Args) => {
  try {
    //buscar la vacante
    const vacancy = await prisma.vacancy.findUnique({
      where: {
        id: vacancyId,
      },
    });

    if (!vacancy) {
      return {
        ok: false,
        message: "La vacante no existe",
      };
    }

    //actualizar la vacante
    await prisma.vacancy.update({
      where: {
        id: vacancyId,
      },
      data: {
        salarioFinal,
        fecha_proxima_entrada: fechaProximaEntrada,
      },
    });

    return {
      ok: true,
      message:
        "Salario final y fecha de proxima entrada actualizados correctamente",
    };
  } catch (e) {
    return {
      ok: false,
      message:
        "Error al actualizar el salario final y la fecha de proxima entrada",
    };
  }
};

//FUNCIONES PARA ESTADISTICAS DE LAS VACANTES

/**
 * Obtiene estadísticas de placements por reclutador para diferentes períodos
 */
export const getRecruiterPlacementStats = async (
  recruiterId: string,
  period: "last_month" | "last_6_months" | "year" | "quarter",
  year?: number,
  quarter?: 1 | 2 | 3 | 4
) => {
  try {
    const session = await auth();
    if (!session?.user) {
      return {
        ok: false,
        message: "No hay usuario logueado",
        data: [],
      };
    }

    let startDate: Date;
    let endDate: Date;
    const now = new Date();

    // Definir rangos de fecha según el período
    switch (period) {
      case "last_month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;

      case "last_6_months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        endDate = now;
        break;

      case "year":
        const targetYear = year || now.getFullYear();
        startDate = new Date(targetYear, 0, 1);
        endDate = new Date(targetYear, 11, 31);
        break;

      case "quarter":
        const targetYearQ = year || now.getFullYear();
        const targetQuarter = quarter || Math.ceil((now.getMonth() + 1) / 3);
        const quarterStartMonth = (targetQuarter - 1) * 3;
        startDate = new Date(targetYearQ, quarterStartMonth, 1);
        endDate = new Date(targetYearQ, quarterStartMonth + 3, 0);
        break;

      default:
        return {
          ok: false,
          message: "Período no válido",
          data: [],
        };
    }

    // Obtener historial de vacantes que llegaron a Placement
    const placementHistory = await prisma.vacancyStatusHistory.findMany({
      where: {
        status: VacancyEstado.Placement,
        changedAt: {
          gte: startDate,
          lte: endDate,
        },
        vacancy: {
          reclutadorId: recruiterId,
        },
      },
      include: {
        vacancy: {
          include: {
            cliente: true,
          },
        },
        changedBy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        changedAt: "asc",
      },
    });

    // Procesar datos según el período
    let processedData: Array<{
      period: string;
      placements: number;
      label: string;
    }> = [];

    switch (period) {
      case "last_month":
        // Agrupar por semanas usando el primer día de la semana
        const weekData = new Map<string, { count: number; label: string }>();

        placementHistory.forEach((record) => {
          const date = new Date(record.changedAt);

          // Obtener el lunes de esa semana
          const dayOfWeek = date.getDay();
          const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Si es domingo (0), retroceder 6 días
          const monday = new Date(date);
          monday.setDate(date.getDate() + diffToMonday);

          // Crear clave única para la semana
          const weekKey = `${monday.getFullYear()}-${monday.getMonth()}-${monday.getDate()}`;

          // Crear label de la semana (ej: "1-7 Ene")
          const endOfWeek = new Date(monday);
          endOfWeek.setDate(monday.getDate() + 6);

          const weekLabel = `${monday.getDate()}-${endOfWeek.getDate()} ${monday.toLocaleDateString(
            "es-ES",
            { month: "short" }
          )}`;

          if (!weekData.has(weekKey)) {
            weekData.set(weekKey, { count: 0, label: weekLabel });
          }

          weekData.get(weekKey)!.count += 1;
        });

        // Generar todas las semanas del mes, incluso si no tienen datos
        const monthStart = new Date(startDate);
        const monthEnd = new Date(endDate);

        // Encontrar el primer lunes del rango
        let currentMonday = new Date(monthStart);
        const dayOfWeek = currentMonday.getDay();
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        currentMonday.setDate(currentMonday.getDate() + diffToMonday);

        // Si el primer lunes está antes del inicio del mes, avanzar a la siguiente semana
        if (currentMonday < monthStart) {
          currentMonday.setDate(currentMonday.getDate() + 7);
        }

        // Generar todas las semanas
        while (currentMonday <= monthEnd) {
          const weekKey = `${currentMonday.getFullYear()}-${currentMonday.getMonth()}-${currentMonday.getDate()}`;
          const endOfWeek = new Date(currentMonday);
          endOfWeek.setDate(currentMonday.getDate() + 6);

          const weekLabel = `${currentMonday.getDate()}-${endOfWeek.getDate()} ${currentMonday.toLocaleDateString(
            "es-ES",
            { month: "short" }
          )}`;

          processedData.push({
            period: weekKey,
            placements: weekData.get(weekKey)?.count || 0,
            label: weekData.get(weekKey)?.label || weekLabel,
          });

          // Avanzar a la siguiente semana
          currentMonday.setDate(currentMonday.getDate() + 7);
        }
        break;

      case "last_6_months":
        // Agrupar por meses (últimos 6)
        const monthData = new Map<string, number>();

        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
          monthData.set(monthKey, 0);
        }

        placementHistory.forEach((record) => {
          const date = new Date(record.changedAt);
          const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
          if (monthData.has(monthKey)) {
            monthData.set(monthKey, monthData.get(monthKey)! + 1);
          }
        });

        monthData.forEach((count, monthKey) => {
          const [yearStr, monthStr] = monthKey.split("-");
          const date = new Date(parseInt(yearStr), parseInt(monthStr), 1);
          processedData.push({
            period: monthKey,
            placements: count,
            label: date.toLocaleDateString("es-ES", {
              month: "short",
              year: "numeric",
            }),
          });
        });
        break;

      case "year":
        // Agrupar por meses del año
        const yearMonthData = new Map<number, number>();

        for (let month = 0; month < 12; month++) {
          yearMonthData.set(month, 0);
        }

        placementHistory.forEach((record) => {
          const date = new Date(record.changedAt);
          const month = date.getMonth();
          yearMonthData.set(month, yearMonthData.get(month)! + 1);
        });

        yearMonthData.forEach((count, month) => {
          const date = new Date(year || now.getFullYear(), month, 1);
          processedData.push({
            period: `month_${month}`,
            placements: count,
            label: date.toLocaleDateString("es-ES", { month: "short" }),
          });
        });
        break;

      case "quarter":
        // Agrupar por meses del cuatrimestre
        const quarterMonthData = new Map<number, number>();
        const quarterStartMonth =
          ((quarter || Math.ceil((now.getMonth() + 1) / 3)) - 1) * 3;

        for (let i = 0; i < 3; i++) {
          quarterMonthData.set(quarterStartMonth + i, 0);
        }

        placementHistory.forEach((record) => {
          const date = new Date(record.changedAt);
          const month = date.getMonth();
          if (quarterMonthData.has(month)) {
            quarterMonthData.set(month, quarterMonthData.get(month)! + 1);
          }
        });

        quarterMonthData.forEach((count, month) => {
          const date = new Date(year || now.getFullYear(), month, 1);
          processedData.push({
            period: `quarter_month_${month}`,
            placements: count,
            label: date.toLocaleDateString("es-ES", { month: "long" }),
          });
        });
        break;
    }

    return {
      ok: true,
      message: "Estadísticas obtenidas correctamente",
      data: processedData,
      totalPlacements: placementHistory.length,
      period,
      dateRange: {
        start: startDate,
        end: endDate,
      },
    };
  } catch (error) {
    console.error("Error al obtener estadísticas de placements:", error);
    return {
      ok: false,
      message: "Error al obtener estadísticas de placements",
      data: [],
    };
  }
};

/**
 * Obtiene resumen de estadísticas generales del reclutador
 */
export const getRecruiterGeneralStats = async (recruiterId: string) => {
  try {
    const session = await auth();
    if (!session?.user) {
      return {
        ok: false,
        message: "No hay usuario logueado",
        stats: null,
      };
    }

    // Obtener estadísticas generales
    const totalVacancies = await prisma.vacancy.count({
      where: { reclutadorId: recruiterId },
    });

    const totalPlacements = await prisma.vacancyStatusHistory.count({
      where: {
        status: VacancyEstado.Placement,
        vacancy: { reclutadorId: recruiterId },
      },
    });

    const activeVacancies = await prisma.vacancy.count({
      where: {
        reclutadorId: recruiterId,
        estado: {
          in: [
            VacancyEstado.Hunting,
            VacancyEstado.Entrevistas,
            VacancyEstado.PrePlacement,
            VacancyEstado.QuickMeeting,
          ],
        },
      },
    });

    const placementRate =
      totalVacancies > 0 ? (totalPlacements / totalVacancies) * 100 : 0;

    // Obtener tiempo promedio para placement
    const placementHistories = await prisma.vacancyStatusHistory.findMany({
      where: {
        status: VacancyEstado.Placement,
        vacancy: { reclutadorId: recruiterId },
      },
      include: {
        vacancy: true,
      },
    });

    let averageDaysToPlacement = 0;
    if (placementHistories.length > 0) {
      const totalDays = placementHistories.reduce((sum, history) => {
        const daysDiff = differenceInCalendarDays(
          new Date(history.changedAt),
          new Date(history.vacancy.fechaAsignacion)
        );
        return sum + Math.max(0, daysDiff);
      }, 0);
      averageDaysToPlacement = Math.round(
        totalDays / placementHistories.length
      );
    }

    return {
      ok: true,
      message: "Estadísticas generales obtenidas correctamente",
      stats: {
        totalVacancies,
        totalPlacements,
        activeVacancies,
        placementRate: Math.round(placementRate * 100) / 100,
        averageDaysToPlacement,
      },
    };
  } catch (error) {
    console.error("Error al obtener estadísticas generales:", error);
    return {
      ok: false,
      message: "Error al obtener estadísticas generales",
      stats: null,
    };
  }
};

/**
 * Obtiene el historial de cambios de estado de una vacante específica
 */
export const getVacancyStatusHistory = async (vacancyId: string) => {
  try {
    const history = await prisma.vacancyStatusHistory.findMany({
      where: { vacancyId },
      include: {
        changedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        changedAt: "desc",
      },
    });

    return {
      ok: true,
      message: "Historial obtenido correctamente",
      history,
    };
  } catch (error) {
    console.error("Error al obtener el historial de la vacante:", error);
    return {
      ok: false,
      message: "Error al obtener el historial de la vacante",
      history: [],
    };
  }
};

/**
 * Obtiene estadísticas del historial de estados para análisis
 */
export const getVacancyStatusStats = async (vacancyId?: string) => {
  try {
    const whereClause = vacancyId ? { vacancyId } : {};

    const stats = await prisma.vacancyStatusHistory.groupBy({
      by: ["status"],
      where: whereClause,
      _count: {
        status: true,
      },
      orderBy: {
        _count: {
          status: "desc",
        },
      },
    });

    // Calcular tiempo promedio entre estados si se especifica una vacante
    let averageTimeByStatus: Record<string, number> | null = null;
    if (vacancyId) {
      const history = await prisma.vacancyStatusHistory.findMany({
        where: { vacancyId },
        orderBy: { changedAt: "asc" },
      });

      if (history.length > 1) {
        const timesByStatus: Record<string, number[]> = {};
        for (let i = 1; i < history.length; i++) {
          const currentStatus = history[i].status;
          const timeDiff =
            new Date(history[i].changedAt).getTime() -
            new Date(history[i - 1].changedAt).getTime();
          const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

          if (!timesByStatus[currentStatus]) {
            timesByStatus[currentStatus] = [];
          }
          timesByStatus[currentStatus].push(daysDiff);
        }

        // Calcular promedio para cada estado
        averageTimeByStatus = {};
        Object.keys(timesByStatus).forEach((status) => {
          const times = timesByStatus[status];
          averageTimeByStatus![status] = Math.round(
            times.reduce((sum, time) => sum + time, 0) / times.length
          );
        });
      }
    }

    return {
      ok: true,
      message: "Estadísticas obtenidas correctamente",
      stats,
      averageTimeByStatus,
    };
  } catch (error) {
    console.error("Error al obtener estadísticas del historial:", error);
    return {
      ok: false,
      message: "Error al obtener estadísticas del historial",
      stats: [],
      averageTimeByStatus: null,
    };
  }
};
