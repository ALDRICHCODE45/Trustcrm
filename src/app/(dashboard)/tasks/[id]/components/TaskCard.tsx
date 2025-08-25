"use client";
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertTriangle,
  CalendarIcon,
  MoreVertical,
  Trash2,
  XCircle,
  MessageSquareReply,
  FolderCheck,
  Building2,
} from "lucide-react";
import { TaskStatus } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
import { TaskWithUsers } from "./TaskKanbanBoard";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EditTaskDialog } from "./EditTaskDialog";
import { useRouter } from "next/navigation";

interface EditData {
  title?: string;
  description?: string;
  dueDate?: Date;
}

interface Props {
  activity: TaskWithUsers;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, editData: EditData) => void;
}

// Componente FormattedDate
const FormattedDate = ({ dateString }: { dateString: string }) => {
  const formatDate = (date: string) => {
    return format(new Date(date), "d MMM", { locale: es });
  };

  const dateObj = new Date(dateString);
  const formattedDate = formatDate(dateString);

  return (
    <div className="flex items-center gap-1">
      <CalendarIcon className="w-3 h-3 text-slate-400" aria-hidden="true" />
      <time
        dateTime={dateObj.toISOString()}
        className="text-xs text-slate-500 dark:text-slate-400"
        aria-label={`Fecha límite: ${formattedDate}`}
      >
        {formattedDate}
      </time>
    </div>
  );
};

// Componente para las acciones de la tarea
const TaskActions = ({ activity, onToggleStatus, onDelete, onEdit }: Props) => {
  const isTaskDone = activity.status === "Done";
  const [vacancyDialogOpen, setVacancyDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const router = useRouter();

  const handleToggleStatus = () => {
    onToggleStatus(activity.id);
    router.refresh();
  };

  const handleViewVacancy = () => {
    setVacancyDialogOpen(true);
  };

  return (
    <>
      {/* Dialog para ver interacción vinculada */}

      {/* Dialog para ver vacante vinculada */}
      <Dialog open={vacancyDialogOpen} onOpenChange={setVacancyDialogOpen}>
        <DialogContent
          className="sm:max-w-[500px]"
          aria-describedby="vacancy-dialog-description"
        >
          <DialogHeader>
            <DialogTitle>Posición de Vacante</DialogTitle>
            <DialogDescription id="vacancy-dialog-description">
              Esta tarea está vinculada a la siguiente vacante
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="vacancy-position">Posición</Label>
              <Input
                id="vacancy-position"
                value={activity.vacancy?.posicion || "Sin posición"}
                readOnly
                className="bg-muted"
                aria-label="Posición de la vacante"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="vacancy-client">Cliente</Label>
              <Input
                id="vacancy-client"
                value={activity.vacancy?.cliente.cuenta || "Sin especificar"}
                readOnly
                className="bg-muted"
                aria-label="Cliente de la vacante"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-3">
                <Label htmlFor="vacancy-status">Estado</Label>
                <Input
                  id="vacancy-status"
                  value={activity.vacancy?.estado || "Sin estado"}
                  readOnly
                  className="bg-muted"
                  aria-label="Estado de la vacante"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="vacancy-priority">Prioridad</Label>
                <Input
                  id="vacancy-priority"
                  value={activity.vacancy?.prioridad || "Sin prioridad"}
                  readOnly
                  className="bg-muted"
                  aria-label="Prioridad de la vacante"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cerrar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dropdown de acciones */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label={`Acciones para la tarea: ${activity.title}`}
          >
            <MoreVertical className="h-4 w-4 opacity-60" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="z-[50]" align="end">
          <DropdownMenuGroup>
            {/* Opción para cambiar estado */}
            {/* Dialog para confirmar cambio de estado */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" className="cursor-pointer">
                  {isTaskDone ? (
                    <>
                      <XCircle
                        className="opacity-60 h-4 w-4 mr-2"
                        aria-hidden="true"
                      />
                      Pendiente
                    </>
                  ) : (
                    <>
                      <FolderCheck
                        className="opacity-60 h-4 w-4 mr-2"
                        aria-hidden="true"
                      />
                      Completar
                    </>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {isTaskDone
                      ? "¿Marcar como pendiente?"
                      : "¿Completar tarea?"}
                  </DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  {isTaskDone
                    ? "¿Estás seguro de que quieres marcar esta tarea como pendiente? Podrás volver a completarla más tarde."
                    : "¿Estás seguro de que quieres marcar esta tarea como completada?"}
                </DialogDescription>
                <DialogFooter className="flex justify-end gap-2">
                  <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                  <Button onClick={handleToggleStatus}>
                    {isTaskDone ? "Marcar pendiente" : "Completar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Dialog para confirmar eliminación */}
            <Dialog>
              <DialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="cursor-pointer text-destructive"
                >
                  <Trash2 size={15} className="opacity-60 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertTriangle className="h-5 w-5" />
                    Confirmar eliminación
                  </DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  ¿Estás seguro de que deseas eliminar esta tarea? Esta acción
                  no se puede deshacer.
                </DialogDescription>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      onDelete(activity.id);
                      setDeleteDialogOpen(false);
                    }}
                  >
                    Eliminar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </DropdownMenuGroup>

          {/* Opción para editar */}
          <EditTaskDialog
            taskId={activity.id}
            onEdit={onEdit}
            activity={activity}
          />

          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {/* Opción para ver interacción */}
            {activity.linkedInteraction?.id && (
              <Dialog>
                <DialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="cursor-pointer"
                  >
                    <MessageSquareReply
                      className="opacity-60 h-4 w-4 mr-2"
                      aria-hidden="true"
                    />
                    Ver Interacción
                  </DropdownMenuItem>
                </DialogTrigger>

                <DialogContent
                  className="sm:max-w-[425px]"
                  aria-describedby="interaction-dialog-description"
                >
                  <DialogHeader>
                    <DialogTitle>Interacción Vinculada</DialogTitle>
                    <DialogDescription id="interaction-dialog-description">
                      Esta tarea está vinculada a la siguiente interacción
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <div className="grid gap-3">
                      <Label htmlFor="contact-name">Contacto</Label>
                      <Input
                        id="contact-name"
                        value={
                          activity.linkedInteraction?.contacto.name ||
                          "Sin contacto"
                        }
                        readOnly
                        className="bg-muted"
                        aria-label="Nombre del contacto"
                      />
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="interaction-content">Contenido</Label>
                      <Textarea
                        id="interaction-content"
                        value={
                          activity.linkedInteraction?.content || "Sin contenido"
                        }
                        readOnly
                        className="bg-muted resize-none min-h-[100px]"
                        aria-label="Contenido de la interacción"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cerrar</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {/* Opción para ver vacante */}
            {activity.vacancy && (
              <DropdownMenuItem
                onClick={handleViewVacancy}
                className="cursor-pointer"
              >
                <Building2
                  className="opacity-60 h-4 w-4 mr-2"
                  aria-hidden="true"
                />
                Ver Posición
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

// Componente principal TaskCard
export const TaskCard = ({
  activity,
  onToggleStatus,
  onDelete,
  onEdit,
}: Props) => {
  const isTaskDone = activity.status === TaskStatus.Done;

  // Función para calcular días restantes y determinar el estilo
  const getDueDateInfo = () => {
    if (isTaskDone) {
      return {
        progressColor: "text-green-600",
        progressBg: "bg-green-100 dark:bg-green-900/20",
        percentage: "100%",
        status: "Completada",
        urgency: "completed" as const,
      };
    }

    const today = new Date();
    const dueDate = new Date(activity.dueDate);
    const timeDiff = dueDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysLeft > 5) {
      return {
        progressColor: "text-blue-600",
        progressBg: "bg-blue-100 dark:bg-blue-900/20",
        percentage: "0%",
        status: "Pendiente",
        urgency: "normal" as const,
      };
    } else if (daysLeft >= 3) {
      return {
        progressColor: "text-orange-600",
        progressBg: "bg-orange-100 dark:bg-orange-900/20",
        percentage: "50%",
        status: "En progreso",
        urgency: "warning" as const,
      };
    } else {
      return {
        progressColor: "text-red-600",
        progressBg: "bg-red-100 dark:bg-red-900/20",
        percentage: "75%",
        status: "Urgente",
        urgency: "urgent" as const,
      };
    }
  };

  const dueDateInfo = getDueDateInfo();

  return (
    <Card
      className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200 cursor-grab active:cursor-grabbing"
      role="article"
      aria-label={`Tarea: ${activity.title}, ${
        isTaskDone ? "completada" : "pendiente"
      }`}
    >
      <div className="space-y-4">
        {/* Header con título y progreso */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm leading-tight">
            {activity.title}
          </h4>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {activity.description}
          </p>

          {/* Información de la vacante (si está vinculada) */}
          {activity.vacancy && (
            <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-700">
              <Building2 className="h-3 w-3 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-blue-800 dark:text-blue-200 truncate">
                  {activity.vacancy.posicion}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 truncate">
                  {activity.vacancy.cliente.cuenta || "Cliente no especificado"}
                </p>
              </div>
            </div>
          )}

          {/* Indicador de progreso */}
          <div className="flex items-center justify-between">
            <div
              className={`px-2 py-1 rounded-full text-xs font-medium ${dueDateInfo.progressBg} ${dueDateInfo.progressColor}`}
            >
              {dueDateInfo.status}
            </div>
            <div
              className={`text-sm font-semibold ${dueDateInfo.progressColor}`}
            >
              {dueDateInfo.percentage}
            </div>
          </div>
        </div>

        {/* Footer con fecha, avatares y acciones */}
        <div className="flex items-center justify-between">
          {/* Fecha */}
          <FormattedDate dateString={activity.dueDate.toISOString()} />

          {/* Avatares y acciones */}
          <div className="flex items-center gap-2">
            {/* Avatares */}
            {activity.notificationRecipients.length > 0 && (
              <div
                className="flex -space-x-1"
                role="group"
                aria-label="Usuarios notificados"
              >
                {activity.notificationRecipients.slice(0, 3).map((user) => (
                  <Tooltip key={user.id}>
                    <TooltipTrigger asChild>
                      <Link
                        href={`/profile/${user.id}`}
                        className="relative z-10"
                      >
                        <Image
                          className="rounded-full border-2 border-white dark:border-slate-800"
                          src={user.image ?? "/default2.png"}
                          width={24}
                          height={24}
                          alt={`Avatar de ${user.name}`}
                        />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span>{user.name}</span>
                    </TooltipContent>
                  </Tooltip>
                ))}
                {activity.notificationRecipients.length > 3 && (
                  <div className="flex items-center justify-center w-6 h-6 text-xs font-medium text-slate-600 bg-slate-100 dark:bg-slate-700 rounded-full border-2 border-white dark:border-slate-800">
                    +{activity.notificationRecipients.length - 3}
                  </div>
                )}
              </div>
            )}

            {/* Acciones */}
            <TaskActions
              activity={activity}
              onToggleStatus={onToggleStatus}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
