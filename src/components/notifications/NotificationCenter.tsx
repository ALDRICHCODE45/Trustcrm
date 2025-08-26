"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Bell, Ban, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { NotificationStatus, Prisma } from "@prisma/client";
import {
  NotificationFilters,
  NotificationFilters as NotificationFiltersType,
} from "./NotificationFilters";
import { NotificationItem } from "./NotificationItem";
import {
  markAsReadNotification,
  deleteNotification,
  markAllAsRead,
  deleteAllRead,
} from "@/actions/notifications/actions";
import { ToastCustomMessage } from "../ToastCustomMessage";

type NotificationWithTask = Prisma.NotificationGetPayload<{
  include: {
    vacancy: {
      include: {
        cliente: true;
        reclutador: true;
      };
    };
    recipient: true;
    task: {
      include: {
        assignedTo: true;
        notificationRecipients: true;
        vacancy: {
          include: {
            cliente: true;
            reclutador: true;
          };
        };
      };
    };
  };
}>;

interface NotificationCenterProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({
  userId,
  isOpen,
  onClose,
}: NotificationCenterProps) {
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
  const [filters, setFilters] = useState<NotificationFiltersType>({
    status: "ALL",
    type: "ALL",
    dateRange: undefined,
    search: "",
  });

  const fetchNotifications = useCallback(async () => {
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
        toast.custom((t) => (
          <ToastCustomMessage
            title="Error al cargar las notificaciones"
            message="Error al cargar las notificaciones"
            type="error"
            onClick={() => {
              toast.dismiss(t);
            }}
          />
        ));
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.custom((t) => (
        <ToastCustomMessage
          title="Error al cargar las notificaciones"
          message="Error al cargar las notificaciones"
          type="error"
          onClick={() => {
            toast.dismiss(t);
          }}
        />
      ));
    } finally {
      setIsLoading(false);
    }
  }, [userId, filters]);

  const handleMarkAsRead = useCallback(
    async (notificationId: string) => {
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

          toast.custom((t) => (
            <ToastCustomMessage
              title="Notificación marcada como leída"
              message="Notificación marcada como leída"
              type="success"
              onClick={() => {
                toast.dismiss(t);
              }}
            />
          ));
        } else {
          toast.custom((t) => (
            <ToastCustomMessage
              title="Error al marcar como leída"
              message="Error al marcar como leída"
              type="error"
              onClick={() => {
                toast.dismiss(t);
              }}
            />
          ));
        }
      } catch (error) {
        console.error("Error marking notification as read:", error);
        toast.custom((t) => (
          <ToastCustomMessage
            title="Error al marcar como leída"
            message="Error al marcar como leída"
            type="error"
            onClick={() => {
              toast.dismiss(t);
            }}
          />
        ));
      } finally {
        setIsMarkingRead(false);
      }
    },
    [stats]
  );

  const handleDelete = useCallback(
    async (notificationId: string) => {
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

          toast.custom((t) => (
            <ToastCustomMessage
              title="Notificación eliminada"
              message="Notificación eliminada"
              type="success"
              onClick={() => {
                toast.dismiss(t);
              }}
            />
          ));
        } else {
          toast.custom((t) => (
            <ToastCustomMessage
              title="Error al eliminar"
              message="Error al eliminar"
              type="error"
              onClick={() => {
                toast.dismiss(t);
              }}
            />
          ));
        }
      } catch (error) {
        console.error("Error deleting notification:", error);
        toast.custom((t) => (
          <ToastCustomMessage
            title="Error al eliminar"
            message="Error al eliminar"
            type="error"
            onClick={() => {
              toast.dismiss(t);
            }}
          />
        ));
      } finally {
        setIsDeleting(false);
      }
    },
    [notifications, stats]
  );

  const handleMarkAllAsRead = useCallback(async () => {
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

        toast.custom((t) => (
          <ToastCustomMessage
            title="Notificaciones marcadas como leídas"
            message="Notificaciones marcadas como leídas"
            type="success"
            onClick={() => {
              toast.dismiss(t);
            }}
          />
        ));
      } else {
        toast.custom((t) => (
          <ToastCustomMessage
            title="Error al marcar todas como leídas"
            message="Error al marcar todas como leídas"
            type="error"
            onClick={() => {
              toast.dismiss(t);
            }}
          />
        ));
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.custom((t) => (
        <ToastCustomMessage
          title="Error al marcar todas como leídas"
          message="Error al marcar todas como leídas"
          type="error"
          onClick={() => {
            toast.dismiss(t);
          }}
        />
      ));
    } finally {
      setIsMarkingAllAsRead(false);
    }
  }, [userId, stats]);

  const handleDeleteAllRead = useCallback(async () => {
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

        toast.custom((t) => (
          <ToastCustomMessage
            title="Notificaciones eliminadas"
            message="Notificaciones eliminadas"
            type="success"
            onClick={() => {
              toast.dismiss(t);
            }}
          />
        ));
      } else {
        toast.custom((t) => (
          <ToastCustomMessage
            title="Error al eliminar las leídas"
            message="Error al eliminar las leídas"
            type="error"
            onClick={() => {
              toast.dismiss(t);
            }}
          />
        ));
      }
    } catch (error) {
      console.error("Error deleting all read:", error);
      toast.custom((t) => (
        <ToastCustomMessage
          title="Error al eliminar las leídas"
          message="Error al eliminar las leídas"
          type="error"
          onClick={() => {
            toast.dismiss(t);
          }}
        />
      ));
    } finally {
      setIsDeletingAllRead(false);
    }
  }, [userId, stats]);

  const handleFiltersChange = useCallback(
    (newFilters: NotificationFiltersType) => {
      setFilters(newFilters);
    },
    []
  );

  // Cargar notificaciones al montar y cuando cambien los filtros
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Polling cada 30 segundos cuando está abierto
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isOpen, fetchNotifications]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[800px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Centro de Notificaciones
              {stats && (
                <Badge variant="secondary" className="ml-2">
                  {stats.total}
                </Badge>
              )}
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchNotifications}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Filtros */}
          <div className="px-6 py-4">
            <NotificationFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onMarkAllAsRead={handleMarkAllAsRead}
              onDeleteAllRead={handleDeleteAllRead}
              isMarkingAllAsRead={isMarkingAllAsRead}
              isDeletingAllRead={isDeletingAllRead}
              stats={stats || undefined}
            />
          </div>

          <Separator />

          {/* Lista de notificaciones */}
          <div className="flex-1 min-h-0 px-6 py-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Cargando notificaciones...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-8 text-center text-muted-foreground">
                <Ban className="h-12 w-12" />
                <div>
                  <p className="text-lg font-medium">No hay notificaciones</p>
                  <p className="text-sm">
                    {filters.status !== "ALL" ||
                    filters.type !== "ALL" ||
                    filters.search ||
                    filters.dateRange
                      ? "No se encontraron notificaciones con los filtros aplicados"
                      : "No tienes notificaciones por el momento"}
                  </p>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-[500px] w-full">
                <div className="space-y-2 pr-4">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onDelete={handleDelete}
                      isMarkingRead={isMarkingRead}
                      isDeleting={isDeleting}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
