import { Prisma } from "@prisma/client";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

// Tipos temporales hasta que se genere Prisma
export type SpecialNotificationWithRelations =
  Prisma.SpecialNotificationGetPayload<{
    include: { recipient: true };
  }>;

interface UseSpecialNotificationsReturn {
  notifications: SpecialNotificationWithRelations[];
  isLoading: boolean;
  isUpdating: boolean;
  fetchNotifications: () => Promise<void>;
  markAsShown: (notificationId: string) => Promise<void>;
  dismissNotification: (notificationId: string) => Promise<void>;
  currentNotification: SpecialNotificationWithRelations | null;
  showNextNotification: () => void;
  hasNotifications: boolean;
}

export function useSpecialNotifications(
  userId: string
): UseSpecialNotificationsReturn {
  const [notifications, setNotifications] = useState<
    SpecialNotificationWithRelations[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentNotificationIndex, setCurrentNotificationIndex] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      console.log("Fetching special notifications for userId:", userId);

      const response = await fetch(
        `/api/special-notifications?userId=${userId}`
      );
      const data = await response.json();

      console.log("API Response:", { status: response.status, data });

      if (response.ok) {
        console.log("Notificaciones especiales obtenidas:", data.notifications);
        setNotifications(data.notifications);
        // Resetear el índice si hay nuevas notificaciones
        if (data.notifications.length > 0) {
          setCurrentNotificationIndex(0);
        }
      } else {
        console.error("Error fetching special notifications:", data);
      }
    } catch (error) {
      console.error("Error fetching special notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const markAsShown = useCallback(async (notificationId: string) => {
    try {
      setIsUpdating(true);
      const response = await fetch("/api/special-notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notificationId,
          action: "shown",
        }),
      });

      if (response.ok) {
        // Remover la notificación de la lista local
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        toast.success("Notificación procesada");
      } else {
        toast.error("Error al procesar la notificación");
      }
    } catch (error) {
      console.error("Error marking notification as shown:", error);
      toast.error("Error al procesar la notificación");
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const dismissNotification = useCallback(async (notificationId: string) => {
    try {
      setIsUpdating(true);
      const response = await fetch("/api/special-notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notificationId,
          action: "dismiss",
        }),
      });

      if (response.ok) {
        // Remover la notificación de la lista local
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        toast.success("Notificación descartada");
      } else {
        toast.error("Error al descartar la notificación");
      }
    } catch (error) {
      console.error("Error dismissing notification:", error);
      toast.error("Error al descartar la notificación");
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const showNextNotification = useCallback(() => {
    if (currentNotificationIndex < notifications.length - 1) {
      setCurrentNotificationIndex((prev) => prev + 1);
    }
  }, [currentNotificationIndex, notifications.length]);

  // Obtener la notificación actual
  const currentNotification =
    notifications.length > 0 && currentNotificationIndex < notifications.length
      ? notifications[currentNotificationIndex]
      : null;

  // Polling cada 30 segundos para nuevas notificaciones
  useEffect(() => {
    if (!userId) return;

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return {
    notifications,
    isLoading,
    isUpdating,
    fetchNotifications,
    markAsShown,
    dismissNotification,
    currentNotification,
    showNextNotification,
    hasNotifications: notifications.length > 0,
  };
}
