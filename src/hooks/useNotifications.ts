import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Notification,
  NotificationStatus,
  NotificationType,
  Prisma,
} from "@prisma/client";
import {
  markAsReadNotification,
  deleteNotification,
  markAllAsRead,
  deleteAllRead,
  getNotificationStats,
} from "@/actions/notifications/actions";

type NotificationWithTask = Prisma.NotificationGetPayload<{
  include: {
    task: {
      include: {
        assignedTo: true;
        notificationRecipients: true;
      };
    };
  };
}>;

export interface NotificationFilters {
  status: NotificationStatus | "ALL";
  type: NotificationType | "ALL";
  dateRange: { from?: Date; to?: Date } | undefined;
  search: string;
}

interface UseNotificationsReturn {
  notifications: NotificationWithTask[];
  stats: { total: number; unread: number; read: number } | null;
  isLoading: boolean;
  isMarkingRead: boolean;
  isDeleting: boolean;
  isMarkingAllAsRead: boolean;
  isDeletingAllRead: boolean;
  filters: NotificationFilters;
  setFilters: (filters: NotificationFilters) => void;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteAllRead: () => Promise<void>;
  clearFilters: () => void;
}

export function useNotifications(userId: string): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<NotificationWithTask[]>(
    []
  );
  const [stats, setStats] = useState<{
    total: number;
    unread: number;
    read: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMarkingAllAsRead, setIsMarkingAllAsRead] = useState(false);
  const [isDeletingAllRead, setIsDeletingAllRead] = useState(false);
  const [filters, setFilters] = useState<NotificationFilters>({
    status: "ALL",
    type: "ALL",
    dateRange: undefined,
    search: "",
  });

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);

      // Construir parámetros de consulta
      const params = new URLSearchParams({
        userId,
        includeStats: "true",
      });

      if (filters.status !== "ALL") {
        params.append("status", filters.status);
      }
      if (filters.type !== "ALL") {
        params.append("type", filters.type);
      }
      if (filters.dateRange?.from) {
        params.append("dateFrom", filters.dateRange.from.toISOString());
      }
      if (filters.dateRange?.to) {
        params.append("dateTo", filters.dateRange.to.toISOString());
      }
      if (filters.search.trim()) {
        params.append("search", filters.search.trim());
      }

      const response = await fetch(`/api/notifications?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setNotifications(data.notifications);
        setStats(data.stats);
      } else {
        toast.error("Error al cargar las notificaciones");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Error al cargar las notificaciones");
    } finally {
      setIsLoading(false);
    }
  }, [userId, filters]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!userId) return;

      try {
        setIsMarkingRead(true);
        const result = await markAsReadNotification(notificationId);

        if (result.ok) {
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === notificationId
                ? { ...n, status: NotificationStatus.READ }
                : n
            )
          );

          // Actualizar estadísticas
          if (stats) {
            setStats({
              ...stats,
              unread: Math.max(0, stats.unread - 1),
              read: stats.read + 1,
            });
          }

          toast.success("Notificación marcada como leída");
        } else {
          toast.error(result.message || "Error al marcar como leída");
        }
      } catch (error) {
        console.error("Error marking notification as read:", error);
        toast.error("Error al marcar como leída");
      } finally {
        setIsMarkingRead(false);
      }
    },
    [userId, stats]
  );

  const deleteNotificationHandler = useCallback(
    async (notificationId: string) => {
      if (!userId) return;

      try {
        setIsDeleting(true);
        const result = await deleteNotification(notificationId);

        if (result.ok) {
          const deletedNotification = notifications.find(
            (n) => n.id === notificationId
          );
          setNotifications((prev) =>
            prev.filter((n) => n.id !== notificationId)
          );

          // Actualizar estadísticas
          if (stats && deletedNotification) {
            const isUnread =
              deletedNotification.status === NotificationStatus.UNREAD;
            setStats({
              ...stats,
              total: stats.total - 1,
              unread: isUnread ? Math.max(0, stats.unread - 1) : stats.unread,
              read: !isUnread ? Math.max(0, stats.read - 1) : stats.read,
            });
          }

          toast.success("Notificación eliminada");
        } else {
          toast.error(result.message || "Error al eliminar");
        }
      } catch (error) {
        console.error("Error deleting notification:", error);
        toast.error("Error al eliminar");
      } finally {
        setIsDeleting(false);
      }
    },
    [userId, notifications, stats]
  );

  const markAllAsReadHandler = useCallback(async () => {
    if (!userId) return;

    try {
      setIsMarkingAllAsRead(true);
      const result = await markAllAsRead(userId);

      if (result.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, status: NotificationStatus.READ }))
        );

        // Actualizar estadísticas
        if (stats) {
          setStats({
            ...stats,
            unread: 0,
            read: stats.total,
          });
        }

        toast.success(result.message);
      } else {
        toast.error(result.message || "Error al marcar todas como leídas");
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Error al marcar todas como leídas");
    } finally {
      setIsMarkingAllAsRead(false);
    }
  }, [userId, stats]);

  const deleteAllReadHandler = useCallback(async () => {
    if (!userId) return;

    try {
      setIsDeletingAllRead(true);
      const result = await deleteAllRead(userId);

      if (result.ok) {
        setNotifications((prev) =>
          prev.filter((n) => n.status === NotificationStatus.UNREAD)
        );

        // Actualizar estadísticas
        if (stats) {
          setStats({
            ...stats,
            total: stats.unread,
            read: 0,
          });
        }

        toast.success(result.message);
      } else {
        toast.error(result.message || "Error al eliminar las leídas");
      }
    } catch (error) {
      console.error("Error deleting all read:", error);
      toast.error("Error al eliminar las leídas");
    } finally {
      setIsDeletingAllRead(false);
    }
  }, [userId, stats]);

  const clearFilters = useCallback(() => {
    setFilters({
      status: "ALL",
      type: "ALL",
      dateRange: undefined,
      search: "",
    });
  }, []);

  // Cargar notificaciones cuando cambien los filtros
  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId, fetchNotifications]);

  return {
    notifications,
    stats,
    isLoading,
    isMarkingRead,
    isDeleting,
    isMarkingAllAsRead,
    isDeletingAllRead,
    filters,
    setFilters,
    fetchNotifications,
    markAsRead,
    deleteNotification: deleteNotificationHandler,
    markAllAsRead: markAllAsReadHandler,
    deleteAllRead: deleteAllReadHandler,
    clearFilters,
  };
}
