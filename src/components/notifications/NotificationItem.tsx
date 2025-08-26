"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  FileSymlink,
  ListCheck,
  MoreVertical,
  Trash,
  UserSearch,
  Clock,
  Bell,
  CheckCircle,
  AlertCircle,
  Edit,
  Building2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { NotificationType, Prisma } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";

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

interface NotificationItemProps {
  notification: NotificationWithTask;
  onMarkAsRead: (notificationId: string) => Promise<void>;
  onDelete: (notificationId: string) => Promise<void>;
  isMarkingRead: boolean;
  isDeleting: boolean;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  isMarkingRead,
  isDeleting,
}: NotificationItemProps) {
  const [selectedTask, setSelectedTask] = useState<NotificationWithTask | null>(
    null
  );
  const [selectedVacancy, setSelectedVacancy] =
    useState<NotificationWithTask | null>(null);

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.TASK_INITIALIZED:
        return <Bell className="h-4 w-4 text-blue-500" />;
      case NotificationType.TASK_COMPLETED:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case NotificationType.TASK_OVERDUE:
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case NotificationType.EDIT:
        return <Edit className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationTypeLabel = (type: NotificationType) => {
    switch (type) {
      case NotificationType.TASK_INITIALIZED:
        return "Tarea Iniciada";
      case NotificationType.TASK_COMPLETED:
        return "Tarea Completada";
      case NotificationType.TASK_OVERDUE:
        return "Tarea Vencida";
      case NotificationType.EDIT:
        return "Edición";
      default:
        return "Notificación";
    }
  };

  const handleMarkAsRead = async () => {
    try {
      await onMarkAsRead(notification.id);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(notification.id);
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  useEffect(() => {
    console.log("notificacion actual", notification);
  }, []);

  return (
    <>
      <div
        className={`relative p-4 pr-12 cursor-pointer transition-all duration-200 hover:bg-muted/50 rounded-lg ${
          notification.status === "UNREAD"
            ? "border-l-4 border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
            : "border-l-4 border-transparent"
        }`}
      >
        {/* Icono y tipo de notificación */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            {getNotificationIcon(notification.type)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">
                {getNotificationTypeLabel(notification.type)}
              </Badge>
              {notification.status === "UNREAD" && (
                <Badge variant="secondary" className="text-xs">
                  Nuevo
                </Badge>
              )}
            </div>

            <p className="text-sm font-medium text-foreground mb-1">
              {notification.message}
            </p>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {formatDistanceToNow(new Date(notification.createdAt), {
                  addSuffix: true,
                  locale: es,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Menú de acciones */}
        <div className="absolute top-3 right-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={isDeleting || isMarkingRead}
              >
                <span className="sr-only">Abrir menú</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 z-[9999]">
              {notification.status === "UNREAD" && (
                <DropdownMenuItem
                  onClick={handleMarkAsRead}
                  className="gap-2 cursor-pointer"
                  disabled={isMarkingRead}
                >
                  <ListCheck className="h-4 w-4" />
                  {isMarkingRead ? "Marcando..." : "Marcar como leído"}
                </DropdownMenuItem>
              )}

              {notification.taskId && (
                <DropdownMenuItem
                  onClick={() => setSelectedTask(notification)}
                  className="gap-2 cursor-pointer"
                  disabled={isDeleting || isMarkingRead}
                >
                  <FileSymlink className="h-4 w-4" />
                  Ver tarea
                </DropdownMenuItem>
              )}

              {notification.vacancyId && (
                <DropdownMenuItem
                  onClick={() => setSelectedVacancy(notification)}
                  className="gap-2 cursor-pointer"
                  disabled={isDeleting || isMarkingRead}
                >
                  <Building2 className="h-4 w-4" />
                  Vacante
                </DropdownMenuItem>
              )}

              {notification.vacancy?.reclutadorId && (
                <DropdownMenuItem
                  className="gap-2 cursor-pointer"
                  disabled={isDeleting || isMarkingRead}
                >
                  <Link
                    href={`/profile/${notification.vacancy?.reclutadorId}`}
                    className="flex gap-2 items-center"
                  >
                    <UserSearch className="h-4 w-4" />
                    Ver usuario
                  </Link>
                </DropdownMenuItem>
              )}

              <DropdownMenuItem
                onClick={handleDelete}
                className="gap-2 cursor-pointer"
                variant="destructive"
                disabled={isDeleting || isMarkingRead}
              >
                <Trash className="h-4 w-4" />
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Diálogo para mostrar detalles de la tarea */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Tarea Compartida</DialogTitle>
              {selectedTask?.task && (
                <Badge variant="outline" className="gap-1.5">
                  <span
                    className="size-1.5 rounded-full bg-emerald-500"
                    aria-hidden="true"
                  ></span>
                  {selectedTask.task.status}
                </Badge>
              )}
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
                  rows={4}
                />
              </div>

              <div>
                <DialogTitle className="text-lg mb-3">
                  Usuarios Involucrados
                </DialogTitle>
                <div className="flex flex-wrap gap-3">
                  {selectedTask.task.notificationRecipients.map((user) => (
                    <Tooltip key={user.id}>
                      <TooltipTrigger asChild>
                        <Link href={`/profile/${user.id}`}>
                          <div className="flex items-center gap-2 p-2 rounded-lg border hover:bg-muted transition-colors">
                            <Image
                              className="ring-background rounded-full ring-2"
                              src={user.image ?? "/default.png"}
                              width={32}
                              height={32}
                              alt={user.name}
                            />
                            <span className="text-sm font-medium">
                              {user.name}
                            </span>
                          </div>
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
    </>
  );
}
