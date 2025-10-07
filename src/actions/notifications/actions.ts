"use server";
import prisma from "@/core/lib/db";
import { NotificationStatus, NotificationType } from "@prisma/client";
import { revalidatePath } from "next/cache";

export const markAsReadNotification = async (notificationId: string) => {
  try {
    //Buscar la notificacion
    const existsNotification = await prisma.notification.findUnique({
      where: {
        id: notificationId,
      },
    });
    if (!existsNotification) {
      return {
        ok: false,
        message: "Notification does not exists",
      };
    }

    if (existsNotification.status === NotificationStatus.READ) {
      return {
        ok: false,
        message: "La notificacion ya esta marcada como leida",
      };
    }

    //Actualizar notification
    await prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        status: NotificationStatus.READ,
      },
    });
    return {
      ok: true,
      message: "Notificacion actualizada",
    };
  } catch (err) {
    throw new Error("Error al marcar la notificacion como leida");
  }
};

export const deleteNotification = async (notificationId: string) => {
  try {
    const existNotification = await prisma.notification.findUnique({
      where: {
        id: notificationId,
      },
    });
    if (!existNotification) {
      return {
        ok: false,
        message: "Error al eliminar la notificacion",
      };
    }

    await prisma.notification.delete({
      where: {
        id: notificationId,
      },
    });

    revalidatePath("/");
    return {
      ok: true,
      message: "Notificacion Eliminada",
    };
  } catch (err) {
    throw new Error("Error al eliminar la notificacion");
  }
};

// Nueva función para marcar todas las notificaciones como leídas
export const markAllAsRead = async (userId: string) => {
  try {
    const updatedCount = await prisma.notification.updateMany({
      where: {
        recipientId: userId,
        status: NotificationStatus.UNREAD,
      },
      data: {
        status: NotificationStatus.READ,
      },
    });

    revalidatePath("/");
    return {
      ok: true,
      message: `${updatedCount.count} notificaciones marcadas como leídas`,
      count: updatedCount.count,
    };
  } catch (err) {
    console.error("Error marking all notifications as read:", err);
    return {
      ok: false,
      message: "Error al marcar todas las notificaciones como leídas",
    };
  }
};

// Nueva función para eliminar todas las notificaciones leídas
export const deleteAllRead = async (userId: string) => {
  try {
    const deletedCount = await prisma.notification.deleteMany({
      where: {
        recipientId: userId,
        status: NotificationStatus.READ,
      },
    });

    revalidatePath("/");
    return {
      ok: true,
      message: `${deletedCount.count} notificaciones eliminadas`,
      count: deletedCount.count,
    };
  } catch (err) {
    console.error("Error deleting read notifications:", err);
    return {
      ok: false,
      message: "Error al eliminar las notificaciones leídas",
    };
  }
};

// Nueva función para obtener notificaciones con filtros
export const getNotificationsWithFilters = async (
  userId: string,
  filters: {
    status?: NotificationStatus;
    type?: NotificationType;
    dateFrom?: Date;
    dateTo?: Date;
    search?: string;
  } = {}
) => {
  try {
    const whereClause: any = {
      recipientId: userId,
    };

    // Filtro por estado
    if (filters.status) {
      whereClause.status = filters.status;
    }

    // Filtro por tipo
    if (filters.type) {
      whereClause.type = filters.type;
    }

    // Filtro por rango de fechas
    if (filters.dateFrom || filters.dateTo) {
      whereClause.createdAt = {};
      if (filters.dateFrom) {
        whereClause.createdAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        whereClause.createdAt.lte = filters.dateTo;
      }
    }

    // Filtro por búsqueda en el mensaje
    if (filters.search) {
      whereClause.message = {
        contains: filters.search,
        mode: "insensitive",
      };
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        task: {
          include: {
            assignedTo: true,
            notificationRecipients: true,
          },
        },
      },
      take: 100, // Limitar a las últimas 100 notificaciones
    });

    return {
      ok: true,
      notifications,
    };
  } catch (err) {
    console.error("Error fetching notifications with filters:", err);
    return {
      ok: false,
      message: "Error al obtener las notificaciones",
      notifications: [],
    };
  }
};

// Nueva función para obtener estadísticas de notificaciones
export const getNotificationStats = async (userId: string) => {
  try {
    const [total, unread, read] = await Promise.all([
      prisma.notification.count({
        where: { recipientId: userId },
      }),
      prisma.notification.count({
        where: {
          recipientId: userId,
          status: NotificationStatus.UNREAD,
        },
      }),
      prisma.notification.count({
        where: {
          recipientId: userId,
          status: NotificationStatus.READ,
        },
      }),
    ]);

    // Obtener conteo por tipo
    const typeStats = await prisma.notification.groupBy({
      by: ["type"],
      where: { recipientId: userId },
      _count: {
        type: true,
      },
    });

    return {
      ok: true,
      stats: {
        total,
        unread,
        read,
        byType: typeStats.reduce((acc, stat) => {
          acc[stat.type] = stat._count.type;
          return acc;
        }, {} as Record<string, number>),
      },
    };
  } catch (err) {
    console.error("Error fetching notification stats:", err);
    return {
      ok: false,
      message: "Error al obtener estadísticas de notificaciones",
      stats: null,
    };
  }
};
