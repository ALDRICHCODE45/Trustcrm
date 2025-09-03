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
  User,
  CircleUserRound,
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
import { Notification, NotificationStatus, Prisma, Role } from "@prisma/client";
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
  DialogTrigger,
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
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "../ConfirmDialog";
import { VacanteTabs } from "@/app/(dashboard)/reclutador/components/kanbanReclutadorBoard";
import { VacancyWithRelations } from "@/app/(dashboard)/reclutador/components/ReclutadorColumns";

// Componente Dot para indicar notificaciones no leídas
function Dot({ className }: { className?: string }) {
  return (
    <svg
      width="6"
      height="6"
      fill="currentColor"
      viewBox="0 0 6 6"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="3" cy="3" r="3" />
    </svg>
  );
}

interface NotificationDropdownProps {
  user_logged: {
    name: string;
    email: string;
    role: Role;
    image: string;
    id: string;
  };
}
type NotificationWithTask = Prisma.NotificationGetPayload<{
  include: {
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
    task: {
      include: {
        assignedTo: true;
        notificationRecipients: true;
      };
    };
  };
}>;

export function NotificationDropdown({
  user_logged,
}: NotificationDropdownProps) {
  const [isMarkingRead, setIsMarkingRead] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationWithTask[]>(
    []
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedTask, setSelectedTask] = useState<NotificationWithTask | null>(
    null
  );
  const [selectedVacancy, setSelectedVacancy] =
    useState<VacancyWithRelations | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/notifications?userId=${user_logged.id}&limit=10`
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
  }, [user_logged.id]);

  useEffect(() => {
    fetchNotifications();
    // Configurar polling cada 30 segundos
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user_logged.id, fetchNotifications]);

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

  const handleMarkAllAsRead = useCallback(async () => {
    const unreadNotifications = notifications.filter(
      (n) => n.status === "UNREAD"
    );
    if (unreadNotifications.length === 0) return;

    try {
      setIsMarkingRead(true);

      // Marcar todas como leídas en paralelo
      const promises = unreadNotifications.map((notification) =>
        markAsReadNotification(notification.id)
      );

      await Promise.all(promises);

      // Actualizar estado local
      setNotifications((prevNotifications) =>
        prevNotifications.map((n) => ({
          ...n,
          status: NotificationStatus.READ,
        }))
      );
      setUnreadCount(0);

      toast.custom((t) => (
        <ToastCustomMessage
          title="Todas las notificaciones marcadas como leídas"
          message="Todas las notificaciones marcadas como leídas"
          type="success"
          onClick={() => {
            toast.dismiss(t);
          }}
        />
      ));
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
      setIsMarkingRead(false);
    }
  }, [notifications, isMarkingRead]);

  const handleNotificationClick = useCallback(
    (notification: NotificationWithTask) => {
      if (notification.status === "UNREAD") {
        handleMarkAsRead(notification.id);
      }
    },
    [handleMarkAsRead]
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
                  <Badge className="absolute -top-2 left-full min-w-5 -translate-x-1/2 px-1">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
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
        <DropdownMenuContent align="end" className="w-96">
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
          <ScrollArea className="h-[350px]  py-2 px-3">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-5 p-4 text-center mt-10 text-sm text-muted-foreground">
                <Ban className="text-center text-gray-400" size={25} />
                No hay notificaciones
              </div>
            ) : (
              notifications.map((notification) => {
                const image =
                  notification.vacancy?.reclutador.image ??
                  notification.task?.assignedTo.image ??
                  "/default.png";
                return (
                  <Card
                    key={notification.id}
                    className="hover:bg-accent rounded-md px-3 py-2 mb-3 text-sm transition-colors relative group"
                  >
                    {/* Contenido de la notificación con nuevo diseño */}
                    <div className="relative flex items-start gap-3 pe-3">
                      {image ? (
                        <Image
                          className="size-9 rounded-md object-cover"
                          src={image}
                          width={36}
                          height={36}
                          alt={
                            notification.vacancy?.reclutador.name ||
                            notification.task?.assignedTo.name ||
                            "Usuario"
                          }
                          quality={95}
                          priority={false}
                        />
                      ) : (
                        <CircleUserRound
                          size={28}
                          strokeWidth={1.6}
                          absoluteStrokeWidth
                          className="size-9 rounded-md object-cover text-muted-foreground"
                        />
                      )}
                      <div className="flex-1 space-y-1 ">
                        <button
                          className="text-foreground/80 text-left after:absolute after:inset-0"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <p className=" w-[93%] text-foreground font-medium hover:underline">
                            {notification.message}
                          </p>
                        </button>
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-muted-foreground text-xs">
                            {formatDistanceToNow(
                              new Date(notification.createdAt),
                              {
                                addSuffix: true,
                                locale: es,
                              }
                            )}
                          </div>

                          {notification.status === "UNREAD" && (
                            <div className="">
                              <Dot />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Menú de acciones */}
                    <div className="absolute top-0 right-0 mt-1.5 mr-1.5">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            disabled={isDeleting || isMarkingRead}
                          >
                            <span className="sr-only">Abrir Menú</span>
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <ConfirmDialog
                            title="Eliminar notificacion"
                            description="¿Estás seguro de querer eliminar esta notificacion?"
                            onConfirm={async () => {
                              await handleDeleteNotification(notification.id);
                            }}
                            trigger={
                              <DropdownMenuItem
                                className="gap-2 text-red-600 hover:bg-red-50 focus:bg-red-100 cursor-pointer"
                                disabled={isDeleting || isMarkingRead}
                              >
                                <Trash className="h-4 w-4" />
                                {isDeleting ? "Eliminando..." : "Eliminar"}
                              </DropdownMenuItem>
                            }
                          />

                          {notification.taskId && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.preventDefault();
                                setSelectedTask(notification);
                              }}
                              className="gap-2 cursor-pointer"
                              disabled={isDeleting || isMarkingRead}
                            >
                              <FileSymlink className="h-4 w-4" />
                              Ver tarea
                            </DropdownMenuItem>
                          )}

                          {notification.vacancyId && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                setSelectedVacancy(notification.vacancy);
                              }}
                              className="gap-2 cursor-pointer"
                              disabled={isDeleting || isMarkingRead}
                            >
                              <Building2 className="h-4 w-4" />
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
                                  <UserSearch className="h-4 w-4" />
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
                                <ListCheck className="h-4 w-4" />
                                {isMarkingRead
                                  ? "Cargando..."
                                  : "Marcar como leído"}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </Card>
                );
              })
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

      {selectedVacancy && (
        <Dialog
          open={!!selectedVacancy}
          onOpenChange={() => setSelectedVacancy(null)}
        >
          <DialogContent className="sm:max-w-[730px] max-h-[90vh] overflow-y-auto z-[900]">
            <DialogHeader>
              <DialogTitle>{selectedVacancy.posicion}</DialogTitle>
              <DialogDescription>
                Detalles de la vacante vinculada.
              </DialogDescription>
            </DialogHeader>
            <VacanteTabs vacante={selectedVacancy} user_logged={user_logged} />
          </DialogContent>
        </Dialog>
      )}

      {/* Centro de Notificaciones */}
      <NotificationCenter
        userId={user_logged.id}
        isOpen={showNotificationCenter}
        onClose={() => setShowNotificationCenter(false)}
      />
    </>
  );
}
