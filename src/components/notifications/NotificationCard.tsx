import Image from "next/image";
import { Card } from "../ui/card";
import { NotificationWithTask } from "./NotificationDropdown";
import {
  CircleUserRound,
  Dot,
  MoreVertical,
  Trash,
  FileSymlink,
  Building2,
  UserSearch,
  ListCheck,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { ConfirmDialog } from "../ConfirmDialog";
import { VacancyWithRelations } from "@/app/(dashboard)/reclutador/components/ReclutadorColumns";
import Link from "next/link";

interface Props {
  notification: NotificationWithTask;
  handleNotificationClick: (id: string) => Promise<void>;
  handleDeleteNotification: (id: string) => Promise<void>;
  isDeleting: boolean;
  isMarkingRead: boolean;
  setSelectedTask: (task: NotificationWithTask) => void;
  setSelectedVacancy: (vacancy: VacancyWithRelations) => void;
  handleMarkAsRead: (id: string) => Promise<void>;
}

export const NotificationCard = ({
  notification,
  handleNotificationClick,
  handleDeleteNotification,
  isDeleting,
  isMarkingRead,
  setSelectedTask,
  setSelectedVacancy,
  handleMarkAsRead,
}: Props) => {
  const image =
    notification.vacancy?.reclutador.image ??
    notification.task?.assignedTo.image ??
    "/default.png";

  return (
    <>
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
              onClick={() => handleNotificationClick(notification.id)}
            >
              <p className=" w-[93%] text-foreground font-medium hover:underline">
                {notification.message}
              </p>
            </button>
            <div className="flex items-center justify-between gap-2">
              <div className="text-muted-foreground text-xs">
                {formatDistanceToNow(new Date(notification.createdAt), {
                  addSuffix: true,
                  locale: es,
                })}
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
                    disabled={isDeleting}
                    onSelect={(e) => {
                      e.preventDefault();
                    }}
                    className="gap-2 text-red-600 hover:bg-red-50 focus:bg-red-100 cursor-pointer"
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
                    setSelectedVacancy(notification.vacancy!);
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
                    {isMarkingRead ? "Cargando..." : "Marcar como leído"}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
    </>
  );
};
