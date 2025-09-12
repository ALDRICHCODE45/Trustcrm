import { Prisma } from "@prisma/client";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ToastCustomMessage } from "@/components/ToastCustomMessage";

// Tipos temporales hasta que se genere Prisma
export type SpecialNotificationWithRelations =
  Prisma.SpecialNotificationGetPayload<{
    include: {
      recipient: true;
      vacancy: {
        include: {
          InputChecklist: {
            include: {
              InputChecklistFeedback: {
                include: {
                  candidate: true;
                };
              };
            };
          };
          reclutador: true;
          cliente: true;
          candidatoContratado: {
            include: {
              cv: true;
              vacanciesContratado: true;
            };
          };
          ternaFinal: {
            include: {
              cv: true;
              vacanciesContratado: true;
            };
          };
          files: true;
          Comments: {
            include: {
              author: true;
            };
          };
        };
      };
    };
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

      const response = await fetch(
        `/api/special-notifications?userId=${userId}`
      );
      const data = await response.json();

      if (response.ok) {
        setNotifications(data.notifications);
        // Resetear el índice si hay nuevas notificaciones
        if (data.notifications.length > 0) {
          setCurrentNotificationIndex(0);
        }
      } else {
        console.error("Error fetching special notifications:");
      }
    } catch (error) {
      console.error("Error fetching special notifications:");
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
        // Al siempre mostrar la primera notificación (índice 0), cuando se remueve una,
        // automáticamente la siguiente toma su lugar
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

        toast.custom((t) =>
          React.createElement(ToastCustomMessage, {
            title: "Notificación procesada",
            message: "Notificación procesada",
            type: "success",
            onClick: () => {
              toast.dismiss(t);
            },
          })
        );
      } else {
        toast.error("Error al procesar la notificación");
      }
    } catch (error) {
      console.error("Error marking notification as shown:");
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
        // Al siempre mostrar la primera notificación (índice 0), cuando se remueve una,
        // automáticamente la siguiente toma su lugar
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        toast.success("Notificación descartada");
      } else {
        toast.error("Error al descartar la notificación");
      }
    } catch (error) {
      console.error("Error dismissing notification:");
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

  // Obtener la notificación actual - siempre mostramos la primera (índice 0)
  // Cuando se remueve una notificación, automáticamente la siguiente toma el lugar de la primera
  const currentNotification =
    notifications.length > 0 ? notifications[0] : null;

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
