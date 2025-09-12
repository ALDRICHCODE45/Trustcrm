"use server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
  NotificationType,
  Role,
  SpecialNotificationPriority,
  SpecialNotificationType,
} from "@prisma/client";
import { createSpecialNotification } from "@/actions/notifications/special-notifications";

interface addCandidateFeedbackProps {
  feedback: string;
  candidateId: string;
  inputChecklistId: string;
}

export const addCandidateFeedback = async (
  props: addCandidateFeedbackProps[]
) => {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    for (const { feedback, candidateId, inputChecklistId } of props) {
      await prisma.inputChecklistFeedback.create({
        data: {
          feedback,
          candidateId,
          inputChecklistId,
        },
      });
    }

    revalidatePath(`/reclutador/kanban`);
    revalidatePath(`/list/reclutamiento`);
    return {
      ok: true,
      message: "Feedback del candidato agregado correctamente",
    };
  } catch (er) {
    return {
      ok: false,
      message: "Error al agregar el feedback del candidato",
    };
  }
};

export const createChecklist = async (
  vacancyId: string,
  inputsChecklist: string[]
) => {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    //buscar la vacante
    const vacancy = await prisma.vacancy.findUnique({
      where: {
        id: vacancyId,
      },
    });

    if (!vacancy) {
      throw new Error("Vacante no encontrada");
    }

    //crear el checklist para la vacante
    for (const content of inputsChecklist) {
      await prisma.inputChecklist.create({
        data: {
          content,
          vacancyId: vacancy.id,
        },
      });
    }

    revalidatePath(`/reclutador/kanban`);
    revalidatePath(`/list/reclutamiento`);
    revalidatePath(`/reclutamiento`);
    return {
      ok: true,
      message: "Checklist creado correctamente",
    };
  } catch (error) {
    return {
      ok: false,
      message: "Error al crear el checklist",
    };
  }
};

//Editar requisito
export const updateChecklist = async (id: string, content: string) => {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    //buscar el requisito
    const requisito = await prisma.inputChecklist.findUnique({
      where: {
        id,
      },
    });

    if (!requisito) {
      throw new Error("Requisito no encontrado");
    }

    //actualizar el requisito
    await prisma.inputChecklist.update({
      where: { id },
      data: { content: content.trim() },
    });

    revalidatePath(`/reclutador/kanban`);
    revalidatePath(`/list/reclutamiento`);
    revalidatePath(`/reclutamiento`);

    return {
      ok: true,
      message: "Requisito actualizado correctamente",
    };
  } catch (error) {
    return {
      ok: false,
      message: "Error al actualizar el requisito",
    };
  }
};

//Eliminar requisito
export const deleteChecklist = async (id: string) => {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    // Verificar si el id es válido
    if (!id || id.trim() === "") {
      throw new Error("ID de requisito inválido");
    }

    //buscar el requisito
    const requisito = await prisma.inputChecklist.findUnique({
      where: {
        id: id.trim(),
      },
    });

    if (!requisito) {
      throw new Error("Requisito no encontrado");
    }

    //eliminar el requisito
    await prisma.inputChecklist.delete({
      where: { id: id.trim() },
    });

    revalidatePath(`/reclutador/kanban`);
    revalidatePath(`/list/reclutamiento`);
    revalidatePath(`/reclutamiento`);

    return {
      ok: true,
      message: "Requisito eliminado correctamente",
    };
  } catch (error) {
    console.error("Error en deleteChecklist:", error);
    return {
      ok: false,
      message: "Error al eliminar el requisito",
    };
  }
};

//Editar feedback de candidato
export const editCandidateFeedback = async (
  feedbackId: string,
  newFeedback: string
) => {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    await prisma.inputChecklistFeedback.update({
      where: {
        id: feedbackId,
      },
      data: {
        feedback: newFeedback,
      },
    });

    revalidatePath(`/reclutador/kanban`);
    revalidatePath(`/list/reclutamiento`);
    return {
      ok: true,
      message: "Feedback del candidato actualizado correctamente",
    };
  } catch (error) {
    return {
      ok: false,
      message: "Error al actualizar el feedback del candidato",
    };
  }
};

//Validar checklist
export const ValidateChecklistAction = async (vacancyId: string) => {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    //buscar vacante
    const vacancy = await prisma.vacancy.findUnique({
      where: {
        id: vacancyId,
      },
    });

    if (!vacancy) {
      throw new Error("Vacante no encontrada");
    }

    //actualizar la vacante
    await prisma.vacancy.update({
      where: {
        id: vacancyId,
      },
      data: {
        IsChecklistValidated: true,
      },
    });
    //crear una notificacion para el reclutador
    await prisma.notification.create({
      data: {
        type: NotificationType.Vacancy,
        message: `El checklist de la vacante ${vacancy.posicion} ha sido validado correctamente`,
        vacancyId,
        recipientId: vacancy.reclutadorId,
      },
    });

    revalidatePath(`/reclutador/kanban`);
    revalidatePath(`/list/reclutamiento`);
    revalidatePath(`/reclutamiento`);

    return {
      ok: true,
      message: "Checklist validado correctamente",
    };
  } catch (error) {
    return {
      ok: false,
      message: "Error al validar el checklist",
    };
  }
};

export const ValidatePerfilMuestraAction = async (vacancyId: string) => {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    //buscar la vacante
    const vacancy = await prisma.vacancy.findUnique({
      where: {
        id: vacancyId,
      },
    });

    if (!vacancy) {
      throw new Error("Vacante no encontrada");
    }

    //actualizar la vacante
    await prisma.vacancy.update({
      where: { id: vacancyId },
      data: { IsPerfilMuestraValidated: true },
    });

    revalidatePath(`/reclutador/kanban`);
    revalidatePath(`/list/reclutamiento`);
    revalidatePath(`/reclutamiento`);

    //crear una notificacion para el reclutador
    await prisma.notification.create({
      data: {
        type: NotificationType.Vacancy,
        message: `El perfil muestra de la vacante ${vacancy.posicion} ha sido validado correctamente`,
        vacancyId,
        recipientId: vacancy.reclutadorId,
      },
    });

    return {
      ok: true,
      message: "Perfil muestra validado correctamente",
    };
  } catch (er) {
    return {
      ok: false,
      message: "Error al validar el perfil muestra",
    };
  }
};

export const completeChecklistAndNotify = async (vacancyId: string) => {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    //buscar vacante para obtener sus datos
    const vacancy = await prisma.vacancy.findUnique({
      where: {
        id: vacancyId,
      },
    });

    if (!vacancy) {
      return {
        ok: false,
        message: "Vacante no encontrada",
      };
    }

    //buscar usuarios administradores
    const administrators = await prisma.user.findMany({
      where: {
        role: Role.Admin,
      },
    });

    if (!administrators) {
      return {
        ok: false,
        message: "Usuarios administradores no encontrados",
      };
    }

    for (const administrator of administrators) {
      const notification = await createSpecialNotification({
        type: SpecialNotificationType.URGENT_TASK_ASSIGNED,
        title: "Checklist completado",
        message: `El checklist de la vacante ${vacancy.posicion} se ha completado correctamente y espera tu validación`,
        recipientId: administrator.id,
        vacancyId: vacancy.id,
        priority: SpecialNotificationPriority.URGENT,
      });

      if (!notification.ok) {
        return {
          ok: false,
          message: "Error al notificar el checklist completado",
        };
      }
    }

    return {
      ok: true,
      message: "Checklist completado y notificado correctamente",
    };
  } catch (e) {
    return {
      ok: false,
      message: "Error al completar el checklist y notificar",
    };
  }
};
