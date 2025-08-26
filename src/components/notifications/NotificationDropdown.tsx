"use client";
import {
  Ban,
  Bell,
  FileSymlink,
  ListCheck,
  MoreVertical,
  Trash,
  UserSearch,
  Settings,
  Building2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCallback, useEffect, useState } from "react";
import { Notification, NotificationStatus, Prisma } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import {
  deleteNotification,
  markAsReadNotification,
} from "@/actions/notifications/actions";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  TooltipContent,
  Tooltip,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "../ui/badge";
import Image from "next/image";
import { NotificationCenter } from "./NotificationCenter";
import { ToastCustomMessage } from "../ToastCustomMessage";

interface NotificationDropdownProps {
  userId: string;
}
type NotificationWithTask = Prisma.NotificationGetPayload<{
  include: {
    vacancy: {
      include: {
        cliente: true;
        reclutador: true;
      };
    };
    task: {
      include: {
        assignedTo: true;
        notificationRecipients: true;
      };
    };
  };
}>;

export function NotificationDropdown({ userId }: NotificationDropdownProps) {
  const [isMarkingRead, setIsMarkingRead] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationWithTask[]>(
    []
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedTask, setSelectedTask] = useState<NotificationWithTask | null>(
    null
  );
  const [selectedVacancy, setSelectedVacancy] =
    useState<NotificationWithTask | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/notifications?userId=${userId}&limit=10`
      );
      const data = await response.json();
      setNotifications(data.notifications);
      setUnreadCount(
        data.notifications.filter((n: Notification) => n.status === "UNREAD")
          .length
      );
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
    // Configurar polling cada 30 segundos
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId, fetchNotifications]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await fetch(`/api/notifications/${notificationId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: NotificationStatus.READ }),
        });
        await fetchNotifications();
        toast.custom((t) => (
          <ToastCustomMessage
            title="Notificacion leida"
            message="Notificacion leida"
            type="success"
            onClick={() => {
              toast.dismiss(t);
            }}
          />
        ));
      } catch (error) {
        console.error("Error marking notification as read:", error);
        toast.custom((t) => (
          <ToastCustomMessage
            title="Error al marcar como leida la notificacion"
            message="Error al marcar como leida la notificacion"
            type="error"
            onClick={() => {
              toast.dismiss(t);
            }}
          />
        ));
      }
    },
    [fetchNotifications]
  );

  const handleMarkAsRead = useCallback(
    async (notificationId: string) => {
      console.log("Reading Notification...", { notificationId });
      if (isMarkingRead) return;

      try {
        setIsMarkingRead(true);
        //TODO:mandar a llamar al server action
        const { ok, message } = await markAsReadNotification(notificationId);
        if (!ok) {
          toast.custom((t) => (
            <ToastCustomMessage
              title="Error al marcar como leida la notificacion"
              message="Error al marcar como leida la notificacion"
              type="error"
              onClick={() => {
                toast.dismiss(t);
              }}
            />
          ));
          return;
        }

        setNotifications((prevNotifications) =>
          prevNotifications.map((n) => {
            if (n.id === notificationId) {
              n.status = NotificationStatus.READ;
            }
            return n;
          })
        );
        toast.custom((t) => (
          <ToastCustomMessage
            title="Notificacion marcada como leida"
            message="Notificacion marcada como leida"
            type="success"
            onClick={() => {
              toast.dismiss(t);
            }}
          />
        ));
      } catch (err) {
        toast.custom((t) => (
          <ToastCustomMessage
            title="Error al marcar como leida"
            message="Error al marcar como leida"
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
    [isMarkingRead]
  );

  const handleDeleteNotification = useCallback(
    async (notificationId: string) => {
      if (isDeleting) return;

      try {
        setIsDeleting(true);
        const result = await deleteNotification(notificationId);

        if (result.ok) {
          // Actualizar el estado local inmediatamente
          setNotifications((prevNotifications) =>
            prevNotifications.filter((n) => n.id !== notificationId)
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
          toast.custom((t) => (
            <ToastCustomMessage
              title="Notificacion Eliminada"
              message="Notificacion Eliminada"
              type="success"
              onClick={() => {
                toast.dismiss(t);
              }}
            />
          ));
        } else {
          toast.custom((t) => (
            <ToastCustomMessage
              title="Error al eliminar la notificacion"
              message="Error al eliminar la notificacion"
              type="error"
              onClick={() => {
                toast.dismiss(t);
              }}
            />
          ));
        }
      } catch (err) {
        console.error("Error deleting notification:", err);
        toast.custom((t) => (
          <ToastCustomMessage
            title="Error al eliminar la notificacion"
            message="Error al eliminar la notificacion"
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
    [isDeleting]
  );

  return (
    <>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            className="dark px-2 py-1 text-xs"
            showArrow={true}
          >
            <span>Notificaciones</span>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="w-80">
          <div className="flex items-center justify-between p-2 border-b">
            <span className="text-sm font-medium">Notificaciones</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotificationCenter(true)}
              className="h-6 px-2 text-xs"
            >
              <Settings className="h-3 w-3 mr-1" />
              Ver todas
            </Button>
          </div>
          <ScrollArea className="h-[300px]">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-5 p-4 text-center mt-10 text-sm text-muted-foreground">
                <Ban className="text-center text-gray-400" size={25} />
                No hay notificaciones
              </div>
            ) : (
              notifications.map((notification) => (
                <div key={notification.id}>
                  <DropdownMenuItem
                    key={notification.id}
                    className={`relative p-4 pr-12 cursor-pointer ${
                      notification.status === "UNREAD"
                        ? "border-l-4 border-blue-500 shadow"
                        : ""
                    }`}
                  >
                    {/* Contenido de la notificación */}
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </p>
                    </div>

                    {/* Menú de acciones en la esquina */}
                    <div className="absolute top-2 right-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={isDeleting || isMarkingRead}
                          >
                            <span className="sr-only">Abrir Menú</span>
                            <MoreVertical />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeleteNotification(notification.id);
                            }}
                            className="gap-2 text-red-600 hover:bg-red-50 focus:bg-red-100 cursor-pointer"
                            disabled={isDeleting || isMarkingRead}
                          >
                            <Trash className="h-4 w-4" />
                            {isDeleting ? "Eliminando..." : "Eliminar"}
                          </DropdownMenuItem>

                          {notification.taskId && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.preventDefault();
                                setSelectedTask(notification);
                              }}
                              className="gap-2 cursor-pointer"
                              disabled={isDeleting || isMarkingRead}
                            >
                              <FileSymlink />
                              Ver tarea
                            </DropdownMenuItem>
                          )}

                          {notification.vacancyId && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.preventDefault();
                                setSelectedVacancy(notification);
                              }}
                              className="gap-2 cursor-pointer"
                              disabled={isDeleting || isMarkingRead}
                            >
                              <Building2 />
                              Vacante
                            </DropdownMenuItem>
                          )}

                          {notification.vacancy?.reclutadorId && (
                            <>
                              <DropdownMenuItem
                                className="gap-2 cursor-pointer"
                                disabled={isDeleting || isMarkingRead}
                              >
                                <Link
                                  href={`/profile/${notification.vacancy?.reclutadorId}`}
                                  className="flex gap-2"
                                >
                                  <UserSearch />
                                  Ver usuario
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleMarkAsRead(notification.id);
                                }}
                                className="gap-2 cursor-pointer"
                                disabled={isMarkingRead || isDeleting}
                              >
                                <ListCheck />
                                {isMarkingRead
                                  ? "Cargando..."
                                  : "Marcar como leído"}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </DropdownMenuItem>
                </div>
              ))
            )}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Diálogo para mostrar detalles de la tarea */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Tarea Compartida</DialogTitle>
              <Badge variant="outline" className="gap-1.5 mr-3">
                <span
                  className="size-1.5 rounded-full bg-emerald-500"
                  aria-hidden="true"
                ></span>
                {selectedTask?.task?.status}
              </Badge>
            </div>
            <DialogDescription>
              Detalles de tu tarea compartida
            </DialogDescription>
          </DialogHeader>
          {selectedTask?.task && (
            <>
              <div className="flex flex-col gap-5">
                <Input
                  type="text"
                  placeholder="Título"
                  defaultValue={selectedTask.task.title}
                  readOnly
                />

                <Textarea
                  placeholder="Descripción"
                  defaultValue={selectedTask.task.description}
                  readOnly
                />
              </div>

              <div>
                <DialogTitle>Usuarios Involucrados</DialogTitle>
                <div className="ml-3 flex -space-x-[0.675rem] mt-3">
                  {selectedTask.task.notificationRecipients.map((user) => (
                    <Tooltip key={user.id}>
                      <TooltipTrigger>
                        <Link href={`/profile/${user.id}`}>
                          <Image
                            className="ring-background rounded-full ring-2"
                            src={user.image ?? "/default.png"}
                            width={35}
                            height={35}
                            alt={user.name}
                          />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <span>{user.name}</span>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo para mostrar detalles de la vacante */}
      <Dialog
        open={!!selectedVacancy}
        onOpenChange={() => setSelectedVacancy(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Posición de Vacante</DialogTitle>
              {selectedVacancy?.vacancy && (
                <Badge variant="outline" className="gap-1.5">
                  <span
                    className="size-1.5 rounded-full bg-blue-500"
                    aria-hidden="true"
                  ></span>
                  {selectedVacancy.vacancy.estado}
                </Badge>
              )}
            </div>
            <DialogDescription>
              Detalles de la vacante vinculada a esta tarea
            </DialogDescription>
          </DialogHeader>

          {selectedVacancy?.vacancy && (
            <>
              <div className="flex flex-col gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Posición
                  </label>
                  <Input
                    type="text"
                    defaultValue={selectedVacancy.vacancy.posicion}
                    readOnly
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Cliente
                  </label>
                  <Input
                    type="text"
                    defaultValue={
                      selectedVacancy.vacancy.cliente.cuenta ||
                      "Sin especificar"
                    }
                    readOnly
                    className="bg-muted"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Estado
                    </label>
                    <Input
                      type="text"
                      defaultValue={selectedVacancy.vacancy.estado}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Prioridad
                    </label>
                    <Input
                      type="text"
                      defaultValue={selectedVacancy.vacancy.prioridad}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>
              </div>

              <div>
                <DialogTitle className="text-lg mb-3">
                  Información del Reclutador
                </DialogTitle>
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                  <Image
                    className="ring-background rounded-full ring-2"
                    src={
                      selectedVacancy.vacancy.reclutador.image ?? "/default.png"
                    }
                    width={40}
                    height={40}
                    alt={selectedVacancy.vacancy.reclutador.name}
                  />
                  <div>
                    <p className="text-sm font-medium">
                      {selectedVacancy.vacancy.reclutador.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedVacancy.vacancy.reclutador.email}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Centro de Notificaciones */}
      <NotificationCenter
        userId={userId}
        isOpen={showNotificationCenter}
        onClose={() => setShowNotificationCenter(false)}
      />
    </>
  );
}
