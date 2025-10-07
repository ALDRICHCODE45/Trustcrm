"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Prisma, TaskStatus, User } from "@prisma/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertTriangle,
  CalendarIcon,
  CheckCircle,
  ClipboardList,
  Edit,
  MoreVertical,
  Plus,
  Trash2,
  XCircle,
  X,
  BellRing,
  MessageSquareReply,
  FolderCheck,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogFooter,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { cn } from "@/core/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  createTask,
  deleteTask,
  editTask,
  toggleTaskStatus,
} from "@/actions/tasks/actions";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import Image from "next/image";
import { DropdownMenuGroup } from "@radix-ui/react-dropdown-menu";

// Interfaces
export interface Activity {
  id: number;
  title: string;
  dueDate: string;
  description: string;
  completed: boolean;
}

interface EditData {
  title?: string;
  description?: string;
  dueDate?: Date;
}

export type TaskWithUsers = Prisma.TaskGetPayload<{
  include: {
    assignedTo: true;
    notificationRecipients: true;
    linkedInteraction: {
      include: {
        contacto: true;
      };
    };
  };
}>;

// Componente FormattedDate mejorado
const FormattedDate = ({ dateString }: { dateString: string }) => {
  const formatDate = (date: string) => {
    return format(new Date(date), "d 'de' MMMM, yyyy", { locale: es });
  };

  const dateObj = new Date(dateString);
  const formattedDate = formatDate(dateString);

  return (
    <div className="flex items-center gap-2 mt-2">
      <CalendarIcon
        className="w-4 h-4 text-muted-foreground"
        aria-hidden="true"
      />
      <time
        dateTime={dateObj.toISOString()}
        className="text-xs text-muted-foreground"
        aria-label={`Fecha límite: ${formattedDate}`}
      >
        {formattedDate}
      </time>
    </div>
  );
};

const EditActivityDialog = ({
  activityId,
  onEdit,
  activity,
}: {
  activityId: string;
  onEdit: (id: string, EditData: EditData) => void;
  activity: TaskWithUsers;
}) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(activity.title || "");
  const [description, setDescription] = useState(activity.description || "");
  const [date, setDate] = useState<Date | undefined>(
    new Date(activity.dueDate) || new Date()
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!title.trim()) {
      toast.error("Por favor, añade un título para la tarea");
      setIsSubmitting(false);
      return;
    }

    if (!description.trim()) {
      toast.error("Por favor añade una descripción para la tarea");
      setIsSubmitting(false);
      return;
    }

    if (!date) {
      toast.error("Por favor, selecciona una fecha límite");
      setIsSubmitting(false);
      return;
    }

    try {
      onEdit(activityId, { description, title, dueDate: date });

      // Limpiar el formulario
      setTitle("");
      setDescription("");
      setDate(new Date());
      setOpen(false);
    } catch (error) {
      // El error se maneja en onEdit
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reiniciar valores cuando se abre el dialog
  useEffect(() => {
    if (open) {
      setTitle(activity.title || "");
      setDescription(activity.description || "");
      setDate(new Date(activity.dueDate));
      setIsSubmitting(false);
    }
  }, [open, activity]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="w-full">
        <div className="flex w-full items-center pl-2 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-sm cursor-pointer">
          <Edit className="opacity-60 mr-2" size={15} aria-hidden="true" />
          <span className="text-sm">Editar</span>
        </div>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-md z-[888]"
        aria-describedby="edit-dialog-description"
      >
        <DialogHeader>
          <DialogTitle>Editar actividad</DialogTitle>
          <DialogDescription id="edit-dialog-description">
            Modifica los campos que desees actualizar
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title" className="text-left">
                Título{" "}
                <span className="text-destructive" aria-label="Campo requerido">
                  *
                </span>
              </Label>
              <Input
                id="edit-title"
                placeholder="Ej: Terminar proyecto de React"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
                aria-required="true"
                aria-invalid={!title.trim() ? "true" : "false"}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-description" className="text-left">
                Descripción{" "}
                <span className="text-destructive" aria-label="Campo requerido">
                  *
                </span>
              </Label>
              <Textarea
                id="edit-description"
                placeholder="Describe los detalles de la tarea..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3 resize-none min-h-[80px]"
                aria-required="true"
                aria-invalid={!description.trim() ? "true" : "false"}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-dueDate" className="text-left">
                Fecha límite{" "}
                <span className="text-destructive" aria-label="Campo requerido">
                  *
                </span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="edit-dueDate"
                    variant="outline"
                    disabled={isSubmitting}
                    className={cn(
                      "justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                    aria-expanded="false"
                    aria-haspopup="dialog"
                    aria-label={
                      date
                        ? `Fecha seleccionada: ${format(
                            date,
                            "d 'de' MMMM, yyyy",
                            { locale: es }
                          )}`
                        : "Seleccionar fecha límite"
                    }
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                    {date ? (
                      format(date, "d 'de' MMMM, yyyy", { locale: es })
                    ) : (
                      <span>Selecciona una fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[900]">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    locale={es}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting || !title.trim() || !description.trim() || !date
              }
            >
              {isSubmitting ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Componente para el diálogo de eliminación
const DeleteActivityDialog = ({
  activityId,
  onDelete,
}: {
  activityId: string;
  onDelete: (id: string) => void;
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          className="cursor-pointer text-destructive"
        >
          <Trash2 size={4} className="opacity-60" />
          Eliminar
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent className="z-[999]">
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={() => onDelete(activityId)}>
            Sí, eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const ActivityActions = ({
  activity,
  onToggleStatus,
  onDelete,
  onEdit,
}: {
  activity: TaskWithUsers;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, editData: EditData) => void;
}) => {
  const isTaskDone = activity.status === "Done";
  const [alertOpen, setAlertOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const handleToggleStatus = () => {
    setAlertOpen(false);
    onToggleStatus(activity.id);
  };

  const handleViewInteraction = () => {
    setOpenDialog(true);
  };

  return (
    <>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
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
                  activity.linkedInteraction?.contacto.name || "Sin contacto"
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
                value={activity.linkedInteraction?.content || "Sin contenido"}
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
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                setAlertOpen(true);
              }}
              className="cursor-pointer"
            >
              {isTaskDone ? (
                <>
                  <XCircle className="opacity-60 h-4 w-4" aria-hidden="true" />
                  Pendiente
                </>
              ) : (
                <>
                  <FolderCheck
                    className="opacity-60 h-4 w-4"
                    aria-hidden="true"
                  />
                  Completar
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuGroup>

          {/* Opción para editar */}
          <EditActivityDialog
            activityId={activity.id}
            onEdit={onEdit}
            activity={activity}
          />

          {/* Opción para eliminar */}
          <DeleteActivityDialog activityId={activity.id} onDelete={onDelete} />

          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {/* Opción para ver interacción */}
            {activity.linkedInteraction?.id && (
              <>
                <DropdownMenuItem
                  onClick={handleViewInteraction}
                  className="cursor-pointer"
                >
                  <MessageSquareReply
                    className="opacity-60 h-4 w-4"
                    aria-hidden="true"
                  />
                  Ver Interacción
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* AlertDialog para confirmar cambio de estado */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isTaskDone ? "¿Marcar como pendiente?" : "¿Completar tarea?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isTaskDone
                ? "¿Estás seguro de que quieres marcar esta tarea como pendiente? Podrás volver a completarla más tarde."
                : "¿Estás seguro de que quieres marcar esta tarea como completada?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleStatus}>
              {isTaskDone ? "Marcar pendiente" : "Completar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// Componente ActivityCard mejorado
const ActivityCard = ({
  activity,
  onToggleStatus,
  onDelete,
  onEdit,
}: {
  activity: TaskWithUsers;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, editData: EditData) => void;
}) => {
  const isTaskDone = activity.status === TaskStatus.Done;

  // Función para calcular días restantes y determinar el estilo
  const getDueDateInfo = () => {
    if (isTaskDone) {
      return {
        borderColor: "border-l-emerald-400",
        bgColor: "",
        textColor: "",
        daysLeft: 0,
        urgency: "completed" as const,
      };
    }

    const today = new Date();
    const dueDate = new Date(activity.dueDate);
    const timeDiff = dueDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysLeft > 5) {
      return {
        borderColor: "border-l-blue-500",
        bgColor: "",
        textColor: "",
        daysLeft,
        urgency: "normal" as const,
      };
    } else if (daysLeft >= 3) {
      return {
        borderColor: "border-l-amber-400",
        bgColor: "",
        textColor: "",
        daysLeft,
        urgency: "warning" as const,
      };
    } else {
      return {
        borderColor: "border-l-red-500",
        bgColor: "bg-red-50",
        textColor: "text-red-700",
        daysLeft,
        urgency: "urgent" as const,
      };
    }
  };

  const dueDateInfo = getDueDateInfo();

  const getUrgencyLabel = () => {
    if (dueDateInfo.urgency === "urgent") {
      return dueDateInfo.daysLeft < 0 ? "Vencida" : "Urgente";
    }
    return "";
  };

  return (
    <Card
      className={`p-4 border-l-4 ${dueDateInfo.borderColor} ${dueDateInfo.bgColor} transition-colors hover:bg-muted/50`}
      role="article"
      aria-label={`Tarea: ${activity.title}, ${
        isTaskDone ? "completada" : "pendiente"
      }`}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <h4
            className={`font-medium break-words ${
              isTaskDone
                ? "line-through text-muted-foreground"
                : dueDateInfo.textColor
            }`}
          >
            {activity.title}
          </h4>
          <p
            className={`text-sm mt-1 break-words ${
              isTaskDone
                ? "line-through text-muted-foreground/70"
                : "text-muted-foreground"
            }`}
          >
            {activity.description}
          </p>

          {isTaskDone ? (
            <div className="flex items-center gap-2 mt-3">
              <CheckCircle
                className="w-4 h-4 text-emerald-500"
                aria-hidden="true"
              />
              <span className="text-xs text-muted-foreground/70">
                Completada
              </span>
            </div>
          ) : (
            <div className="flex justify-between items-center mt-3">
              <FormattedDate dateString={activity.dueDate.toISOString()} />
              {dueDateInfo.urgency === "urgent" && (
                <div className="flex items-center gap-1">
                  <AlertTriangle
                    className="w-4 h-4 text-red-500"
                    aria-hidden="true"
                  />
                  <span
                    className="text-xs font-medium text-red-500"
                    aria-label={`Tarea ${getUrgencyLabel().toLowerCase()}`}
                  >
                    {getUrgencyLabel()}
                  </span>
                </div>
              )}
            </div>
          )}

          {activity.notificationRecipients.length > 0 && (
            <div
              className="flex -space-x-2 mt-3"
              role="group"
              aria-label="Usuarios que serán notificados"
            >
              {activity.notificationRecipients.map((user, index) => (
                <Tooltip key={user.id}>
                  <TooltipTrigger asChild>
                    <Link
                      href={`/profile/${user.id}`}
                      className=""
                      tabIndex={0}
                    >
                      <Image
                        className=""
                        src={user.image ?? "/default2.png"}
                        width={28}
                        height={28}
                        alt={`Avatar de ${user.name}`}
                      />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>{user.name}</span>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          )}
        </div>

        <div className="flex-shrink-0">
          <ActivityActions
            activity={activity}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        </div>
      </div>
    </Card>
  );
};

// Componente de mensaje vacío
const EmptyState = ({ type }: { type: TaskStatus }) => {
  return (
    <div className="flex flex-col items-center justify-center h-60 text-center">
      {type === "Pending" ? (
        <CheckCircle className="h-10 w-10 text-primary/50 mb-2" />
      ) : (
        <ClipboardList className="h-10 w-10 text-primary/50 mb-2" />
      )}
      <p className="text-muted-foreground">
        No hay actividades {type === "Pending" ? "pendientes" : "completadas"}
      </p>
    </div>
  );
};

// Componente de lista de actividades CORREGIDO
const ActivitiesList = ({
  activities,
  onToggleStatus,
  onDelete,
  onEdit,
}: {
  activities: TaskWithUsers[];
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, editData: EditData) => void;
}) => {
  return (
    <div className="h-[500px] w-full">
      <ScrollArea className="h-full w-full rounded-md border">
        <div className="p-4 space-y-3">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <ActivityCard
                onEdit={onEdit}
                key={activity.id}
                activity={activity}
                onToggleStatus={onToggleStatus}
                onDelete={onDelete}
              />
            ))
          ) : (
            <EmptyState
              type={activities[0]?.status === "Done" ? "Done" : "Pending"}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
// Componente principal
export const ActivityProfileSheet = ({
  user,
  tasks,
}: {
  user: User;
  tasks: TaskWithUsers[];
}) => {
  // Función para cambiar el estado de una actividad
  const toggleActivityStatus = async (taskId: string) => {
    try {
      const promise = toggleTaskStatus(user.id, taskId);
      toast.promise(promise, {
        loading: "Loading...",
        success: (data) => {
          return `Tarea editada correctamente`;
        },
        error: "Error al editar la tarea, revisa los logs",
      });
    } catch (error) {
      toast.error("Error al editar la tarea");
    }
  };

  // Función para eliminar una actividad
  const deleteActivity = async (taskId: string) => {
    try {
      const result = await deleteTask(user.id, taskId);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success("Tarea eliminada correctamente");
    } catch (error) {
      toast.error("Error al eliminar la tarea");
    }
  };

  // Filtrar actividades
  const pendingActivities = tasks.filter(
    (activity) => activity.status === "Pending"
  );
  const completedActivities = tasks.filter(
    (activity) => activity.status === "Done"
  );

  const addActivity = async (activityData: {
    title: string;
    description: string;
    dueDate: Date;
    notifyOnComplete: boolean;
    notificationRecipients: string[];
  }) => {
    const formData = new FormData();
    formData.append("title", activityData.title);
    formData.append("description", activityData.description);
    formData.append("dueDate", activityData.dueDate.toISOString());
    formData.append("userId", user.id);
    formData.append(
      "notifyOnComplete",
      activityData.notifyOnComplete.toString()
    );
    activityData.notificationRecipients.forEach((recipientId) => {
      formData.append("notificationRecipients", recipientId);
    });
    console.log("Client Data: ", { formData });

    try {
      const { ok, message } = await createTask(formData);
      if (!ok) {
        toast.error(message);
        console.log(message);
        return;
      }
      toast.success("Tarea creada satisfactoriamente!!");
    } catch (error) {
      toast.error("Error al crear la task");
    }
  };

  const onEdit = async (id: string, data: EditData) => {
    const formData = new FormData();

    formData.append("title", data.title!);
    formData.append("description", data.description!);
    formData.append("dueDate", data.dueDate?.toISOString()!);
    formData.append("userId", user.id);

    try {
      const promise = editTask(id, formData);
      toast.promise(promise, {
        loading: "Loading...",
        success: () => {
          return `Tarea editada correctamente`;
        },
        error: "Error al editar la tarea",
      });
    } catch (error) {
      console.log(error);
      toast.error("Error editando la tarea");
    }
  };

  return (
    <div className="mt-4 md:mt-0">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            <span>Actividades</span>
            {pendingActivities.length > 0 && (
              <Badge variant="secondary">{pendingActivities.length}</Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Actividades de {user?.name}</SheetTitle>
            <SheetDescription>
              Gestiona las actividades y tareas pendientes.
            </SheetDescription>
          </SheetHeader>

          <Tabs defaultValue="pending" className="mt-6">
            <TabsList className="w-full grid grid-cols-2 h-full">
              <TabsTrigger value="pending" className="text-xs md:text-base">
                Pendientes ({pendingActivities.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-xs md:text-base">
                Completadas ({completedActivities.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-4">
              <ActivitiesList
                activities={pendingActivities}
                onToggleStatus={toggleActivityStatus}
                onDelete={deleteActivity}
                onEdit={onEdit}
              />
            </TabsContent>

            <TabsContent value="completed" className="mt-4">
              <ActivitiesList
                activities={completedActivities}
                onToggleStatus={toggleActivityStatus}
                onDelete={deleteActivity}
                onEdit={onEdit}
              />
            </TabsContent>
          </Tabs>

          <SheetFooter className="flex flex-row justify-between items-center w-full mt-6">
            <AddActivityDialog onAddActivity={addActivity} />
            <SheetClose asChild>
              <Button size="sm">
                <span className="text-xs md:text-base">Cerrar</span>
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

// Componente AddActivityDialog.tsx
interface AddActivityDialogProps {
  onAddActivity: (activity: {
    title: string;
    description: string;
    dueDate: Date;
    notifyOnComplete: boolean;
    notificationRecipients: string[];
  }) => void;
}

export const AddActivityDialog = ({
  onAddActivity,
}: AddActivityDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!open) return; // Solo cargar cuando se abre el dialog

      setIsLoadingUsers(true);
      try {
        const response = await fetch("/api/users");
        const data = await response.json();
        setUsers(data.users || []);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Error al cargar usuarios");
      } finally {
        setIsLoadingUsers(false);
      }
    };

    if (open) {
      fetchUsers();
    }
  }, [open]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDate(new Date());
    setNotificationsEnabled(false);
    setSelectedUsers([]);
    setIsSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!title.trim()) {
      toast.error("Por favor, añade un título para la tarea");
      setIsSubmitting(false);
      return;
    }

    if (!description.trim()) {
      toast.error("Por favor añade una descripción para la tarea");
      setIsSubmitting(false);
      return;
    }

    if (!date) {
      toast.error("Por favor, selecciona una fecha límite");
      setIsSubmitting(false);
      return;
    }

    try {
      onAddActivity({
        title,
        description,
        dueDate: date,
        notifyOnComplete: notificationsEnabled,
        notificationRecipients: selectedUsers,
      });

      resetForm();
      setOpen(false);
    } catch (error) {
      // El error se maneja en onAddActivity
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) {
      resetForm();
    }
    setOpen(newOpen);
  };

  const removeUser = (userIdToRemove: string) => {
    setSelectedUsers(selectedUsers.filter((id) => id !== userIdToRemove));
  };

  const canSubmit = title.trim() && description.trim() && date && !isSubmitting;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
          <span className="text-xs md:text-base">Agregar Actividad</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-md z-[888]"
        aria-describedby="add-dialog-description"
      >
        <DialogHeader>
          <DialogTitle>Nueva actividad</DialogTitle>
          <DialogDescription id="add-dialog-description">
            Crea una nueva tarea o actividad para tu lista.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-title" className="text-left">
                Título{" "}
                <span className="text-destructive" aria-label="Campo requerido">
                  *
                </span>
              </Label>
              <Input
                id="new-title"
                placeholder="Ej: Terminar proyecto de React"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
                aria-required="true"
                aria-invalid={!title.trim() ? "true" : "false"}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="new-description" className="text-left">
                Descripción{" "}
                <span className="text-destructive" aria-label="Campo requerido">
                  *
                </span>
              </Label>
              <Textarea
                id="new-description"
                placeholder="Describe los detalles de la tarea..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3 resize-none min-h-[80px]"
                aria-required="true"
                aria-invalid={!description.trim() ? "true" : "false"}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="new-dueDate" className="text-left">
                Fecha límite{" "}
                <span className="text-destructive" aria-label="Campo requerido">
                  *
                </span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="new-dueDate"
                    variant="outline"
                    disabled={isSubmitting}
                    className={cn(
                      "justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                    aria-expanded="false"
                    aria-haspopup="dialog"
                    aria-label={
                      date
                        ? `Fecha seleccionada: ${format(
                            date,
                            "d 'de' MMMM, yyyy",
                            { locale: es }
                          )}`
                        : "Seleccionar fecha límite"
                    }
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                    {date ? (
                      format(date, "d 'de' MMMM, yyyy", { locale: es })
                    ) : (
                      <span>Selecciona una fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[900]">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    locale={es}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <div className="border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2">
                  <Switch
                    id="new-notifications"
                    className="order-1 h-4 w-6 after:absolute after:inset-0 [&_span]:size-3 data-[state=checked]:[&_span]:translate-x-2 data-[state=checked]:[&_span]:rtl:-translate-x-2"
                    aria-describedby="notifications-description"
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                    disabled={isSubmitting}
                  />
                  <div className="flex grow items-center gap-3">
                    <BellRing aria-hidden="true" />
                    <div className="grid grow gap-2">
                      <Label htmlFor="new-notifications">
                        Notificar{" "}
                        <span className="text-muted-foreground text-xs leading-[inherit] font-normal">
                          (Al completar)
                        </span>
                      </Label>
                      <p
                        id="notifications-description"
                        className="text-muted-foreground text-xs"
                      >
                        Al activar esta opción los usuarios serán notificados
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {notificationsEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="user-select">
                    Destinatarios de la notificación
                  </Label>
                  <Select
                    onValueChange={(value) => {
                      if (!selectedUsers.includes(value)) {
                        setSelectedUsers([...selectedUsers, value]);
                      }
                    }}
                    disabled={isSubmitting || isLoadingUsers}
                  >
                    <SelectTrigger id="user-select">
                      <SelectValue
                        placeholder={
                          isLoadingUsers
                            ? "Cargando usuarios..."
                            : "Seleccionar usuarios"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      {users.map((user) => (
                        <SelectItem
                          key={user.id}
                          value={user.id}
                          disabled={selectedUsers.includes(user.id)}
                        >
                          {user.name}
                        </SelectItem>
                      ))}
                      {users.length === 0 && !isLoadingUsers && (
                        <SelectItem value="" disabled>
                          No hay usuarios disponibles
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>

                  {selectedUsers.length > 0 && (
                    <div
                      className="flex flex-wrap gap-2 mt-2"
                      role="group"
                      aria-label="Usuarios seleccionados"
                    >
                      {selectedUsers.map((userId) => {
                        const user = users.find((u) => u.id === userId);
                        return (
                          <Badge
                            key={userId}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {user?.name || "Usuario desconocido"}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 hover:bg-transparent"
                              onClick={() => removeUser(userId)}
                              disabled={isSubmitting}
                              aria-label={`Eliminar ${user?.name} de la lista`}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {isSubmitting ? "Creando..." : "Crear tarea"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
