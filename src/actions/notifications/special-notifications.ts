"use server";

import prisma from "@/lib/db";
import {
  SpecialNotificationType,
  SpecialNotificationStatus,
  SpecialNotificationPriority,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface CreateSpecialNotificationData {
  type: SpecialNotificationType;
  title: string;
  message: string;
  recipientId: string;
  priority?: SpecialNotificationPriority;
  metadata?: any;
  vacancyId?: string;
  taskId?: string;
  clientId?: string;
  expiresAt?: Date;
}

// Crear una notificación especial
export const createSpecialNotification = async (
  data: CreateSpecialNotificationData
) => {
  try {
    // Verificar que el destinatario existe
    const recipient = await prisma.user.findUnique({
      where: { id: data.recipientId },
    });

    if (!recipient) {
      return {
        ok: false,
        message: "El destinatario no existe",
      };
    }

    const specialNotification = await prisma.specialNotification.create({
      data: {
        type: data.type,
        title: data.title,
        message: data.message,
        recipientId: data.recipientId,
        priority: data.priority || SpecialNotificationPriority.MEDIUM,
        metadata: data.metadata,
        vacancyId: data.vacancyId,
        taskId: data.taskId,
        clientId: data.clientId,
        expiresAt: data.expiresAt,
      },
      include: {
        recipient: true,
        vacancy: {
          include: {
            cliente: true,
            reclutador: true,
          },
        },
        task: true,
        client: true,
      },
    });

    revalidatePath("/");
    return {
      ok: true,
      message: "Notificación especial creada correctamente",
      notification: specialNotification,
    };
  } catch (error) {
    console.error("Error creating special notification:", error);
    return {
      ok: false,
      message: "Error al crear la notificación especial",
    };
  }
};

// Obtener notificaciones especiales pendientes para un usuario
export const getPendingSpecialNotifications = async (userId: string) => {
  try {
    const notifications = await prisma.specialNotification.findMany({
      where: {
        recipientId: userId,
        status: SpecialNotificationStatus.PENDING,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      include: {
        recipient: true,
        vacancy: {
          include: {
            cliente: true,
            reclutador: true,
          },
        },
        task: {
          include: {
            assignedTo: true,
          },
        },
        client: true,
      },
    });

    return {
      ok: true,
      notifications,
    };
  } catch (error) {
    console.error("Error fetching pending special notifications:", error);
    return {
      ok: false,
      message: "Error al obtener las notificaciones especiales",
      notifications: [],
    };
  }
};

// Marcar notificación especial como mostrada
export const markSpecialNotificationAsShown = async (
  notificationId: string
) => {
  try {
    const notification = await prisma.specialNotification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return {
        ok: false,
        message: "Notificación no encontrada",
      };
    }

    await prisma.specialNotification.update({
      where: { id: notificationId },
      data: {
        status: SpecialNotificationStatus.SHOWN,
      },
    });

    revalidatePath("/");
    return {
      ok: true,
      message: "Notificación marcada como mostrada",
    };
  } catch (error) {
    console.error("Error marking special notification as shown:", error);
    return {
      ok: false,
      message: "Error al marcar la notificación como mostrada",
    };
  }
};

// Descartar notificación especial
export const dismissSpecialNotification = async (notificationId: string) => {
  try {
    const notification = await prisma.specialNotification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return {
        ok: false,
        message: "Notificación no encontrada",
      };
    }

    await prisma.specialNotification.update({
      where: { id: notificationId },
      data: {
        status: SpecialNotificationStatus.DISMISSED,
      },
    });

    revalidatePath("/");
    return {
      ok: true,
      message: "Notificación descartada",
    };
  } catch (error) {
    console.error("Error dismissing special notification:", error);
    return {
      ok: false,
      message: "Error al descartar la notificación",
    };
  }
};

// Limpiar notificaciones expiradas
export const cleanupExpiredSpecialNotifications = async () => {
  try {
    const deletedCount = await prisma.specialNotification.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return {
      ok: true,
      message: `${deletedCount.count} notificaciones expiradas eliminadas`,
      count: deletedCount.count,
    };
  } catch (error) {
    console.error("Error cleaning up expired notifications:", error);
    return {
      ok: false,
      message: "Error al limpiar notificaciones expiradas",
    };
  }
};

// Función específica para crear notificación de vacante asignada
export const createVacancyAssignedNotification = async (
  vacancyId: string,
  reclutadorId: string,
  creatorId: string,
  sendNotification: boolean = true
) => {
  try {
    // Solo crear notificación si se solicita y el reclutador es diferente al creador
    if (!sendNotification || reclutadorId === creatorId) {
      return {
        ok: true,
        message: "Notificación no enviada (mismo usuario o no solicitada)",
      };
    }

    // Obtener datos de la vacante
    const vacancy = await prisma.vacancy.findUnique({
      where: { id: vacancyId },
      include: {
        cliente: true,
        reclutador: true,
      },
    });

    if (!vacancy) {
      return {
        ok: false,
        message: "Vacante no encontrada",
      };
    }

    const metadata = {
      vacancyId: vacancy.id,
      posicion: vacancy.posicion,
      cliente: vacancy.cliente.cuenta,
      prioridad: vacancy.prioridad,
      fechaEntrega: vacancy.fechaEntrega?.toISOString(),
      salario: vacancy.salario,
    };

    return await createSpecialNotification({
      type: SpecialNotificationType.VACANCY_ASSIGNED,
      title: "Nueva Vacante Asignada",
      message: `Te han asignado la vacante "${vacancy.posicion}" para el cliente ${vacancy.cliente.cuenta}`,
      recipientId: reclutadorId,
      priority:
        vacancy.prioridad === "Alta"
          ? SpecialNotificationPriority.HIGH
          : vacancy.prioridad === "Normal"
          ? SpecialNotificationPriority.MEDIUM
          : SpecialNotificationPriority.LOW,
      metadata,
      vacancyId: vacancy.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expira en 7 días
    });
  } catch (error) {
    console.error("Error creating vacancy assigned notification:", error);
    return {
      ok: false,
      message: "Error al crear la notificación de vacante asignada",
    };
  }
};
