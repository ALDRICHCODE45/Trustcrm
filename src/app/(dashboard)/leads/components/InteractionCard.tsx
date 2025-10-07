"use client";
import {
  ContactInteractionWithRelations,
  deleteInteractionById,
  editInteractionById,
  getContactosByLeadId,
  getTasksByInteractionId,
  TaskWithUsers,
} from "@/actions/leadSeguimiento/ations";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar,
  CalendarPlus,
  Download,
  Edit,
  ExternalLink,
  Loader2,
  MoreVertical,
  PaperclipIcon,
  Plus,
  RefreshCw,
  Trash2,
  UploadCloud,
  X,
  ClipboardList,
  CheckCircle,
  AlertTriangle,
  Clock,
  BellRing,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Attachment } from "./ContactCard";
import { deleteFile, uploadFile } from "@/actions/files/actions";
import { cn } from "@/core/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { createTaskFromContactInteractionLinked } from "@/actions/tasks/actions";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useCallback } from "react";
import { LeadWithRelations } from "../kanban/page";

interface Props {
  interaction: ContactInteractionWithRelations;
  setInteractions: React.Dispatch<
    React.SetStateAction<ContactInteractionWithRelations[]>
  >;
  setOpenTaskDialog?: React.Dispatch<React.SetStateAction<boolean>>;
  updateLeadInState?: (
    leadId: string,
    updates: Partial<LeadWithRelations>
  ) => void;
}

export const InteractionCard = ({
  interaction,
  setInteractions,
  updateLeadInState,
}: Props) => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [newContent, setNewContent] = useState<string>(interaction.content);
  const [attachmentInfo, setAttachmentInfo] = useState<Attachment | null>(
    interaction.attachmentUrl
      ? {
          attachmentName: interaction.attachmentName || "Archivo adjunto",
          attachmentType: interaction.attachmentType || "",
          attachmentUrl: interaction.attachmentUrl,
        }
      : null
  );
  const [isAttachmentChanged, setIsAttachmentChanged] =
    useState<boolean>(false);

  return (
    <>
      <InteractionCardView
        interaction={interaction}
        setOpenDialog={setOpenDialog}
        deleteInteraction={(id) =>
          handleDeleteInteraction(
            id,
            setInteractions,
            updateLeadInState,
            interaction
          )
        }
      />

      <EditInteractionDialog
        open={openDialog}
        setOpen={setOpenDialog}
        isPending={isPending}
        newContent={newContent}
        setNewContent={setNewContent}
        attachmentInfo={attachmentInfo}
        interaction={interaction}
        handleSubmit={(e) =>
          handleSubmit(
            e,
            newContent,
            attachmentInfo,
            isAttachmentChanged,
            interaction,
            setInteractions,
            setIsPending,
            setOpenDialog,
            setIsAttachmentChanged,
            updateLeadInState
          )
        }
        handleNewFileChange={(e) =>
          handleNewFileChange(
            e,
            setIsPending,
            setAttachmentInfo,
            setIsAttachmentChanged
          )
        }
        handleDeleteFile={() => {
          setAttachmentInfo(null);
          setIsAttachmentChanged(true);
        }}
      />
    </>
  );
};

// Componente para la vista de la tarjeta de interacción
const InteractionCardView = ({
  interaction,
  setOpenDialog,
  deleteInteraction,
}: {
  interaction: ContactInteractionWithRelations;
  setOpenDialog: (open: boolean) => void;
  deleteInteraction: (id: string) => void;
}) => {
  return (
    <Card
      key={interaction.id}
      className={cn(
        "border-l-4 relative group hover:shadow-md transition-all duration-200 w-full min-h-fit overflow-hidden",
        interaction.attachmentUrl ? "border-l-blue-500" : "border-l-primary"
      )}
    >
      <CardHeader className="py-3 px-4 pb-2 pr-12">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <InteractionAuthorInfo interaction={interaction} />
          </div>
          <div className="flex-shrink-0">
            <InteractionOptionsMenu
              interactionId={interaction.id}
              content={interaction.content}
              setOpenDialog={setOpenDialog}
              deleteInteraction={deleteInteraction}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-2 px-4 pr-8">
        <p className="text-sm whitespace-pre-wrap break-words hyphens-auto leading-relaxed">
          {interaction.content}
        </p>
      </CardContent>
      {interaction.attachmentUrl && (
        <AttachmentFooter
          attachmentUrl={interaction.attachmentUrl}
          attachmentName={interaction.attachmentName}
        />
      )}
    </Card>
  );
};

// Componente para la información del autor
const InteractionAuthorInfo = ({
  interaction,
}: {
  interaction: ContactInteractionWithRelations;
}) => {
  const getTimeAgo = (date: Date | string) => {
    // Asegurar que date sea un objeto Date válido
    const dateObj = date instanceof Date ? date : new Date(date);

    // Validar que la fecha sea válida
    if (isNaN(dateObj.getTime())) {
      return "Fecha inválida";
    }

    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - dateObj.getTime()) / 1000
    );

    if (diffInSeconds < 60) return `hace ${diffInSeconds} segundos`;

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `hace ${diffInMinutes} minutos`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `hace ${diffInHours} horas`;

    // Si es más de un día, mostrar la fecha formateada
    return format(dateObj, "eee dd/MM/yyyy", { locale: es });
  };

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-8 w-8 ring-2 ring-offset-2 ring-primary/20">
        <AvatarImage
          src={interaction.autor.image || ""}
          className="object-cover"
        />
        <AvatarFallback className="bg-primary/10 text-primary font-medium">
          {interaction.autor.name.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div>
        <CardTitle className="text-sm font-medium">
          {interaction.autor.name}
        </CardTitle>
        <CardDescription className="text-xs flex items-center gap-1">
          <span>{getTimeAgo(interaction.createdAt)}</span>
          {interaction.createdAt !== interaction.updatedAt && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span className="text-xs text-muted-foreground italic flex items-center">
                    <RefreshCw className="h-3 w-3 ml-1" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    Editado:{" "}
                    {format(
                      new Date(interaction.updatedAt),
                      "dd/MM/yyyy HH:mm",
                      {
                        locale: es,
                      }
                    )}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardDescription>
      </div>
    </div>
  );
};

// Componente para el menú de opciones
const InteractionOptionsMenu = ({
  interactionId,
  content,
  setOpenDialog,
  deleteInteraction,
}: {
  interactionId: string;
  content: string;
  setOpenDialog: (open: boolean) => void;
  deleteInteraction: (id: string) => void;
}) => {
  // Estado para el diálogo de crear tarea
  const [openCreateTask, setOpenCreateTask] = useState<boolean>(false);
  // Estado para el diálogo de ver tareas vinculadas
  const [openLinkedTasks, setOpenLinkedTasks] = useState<boolean>(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="z-[999]">
          <DropdownMenuItem
            onClick={() => {
              console.log("Crear tarea para la interaccion: ", {
                interactionId,
              });
              setOpenCreateTask(true);
            }}
            className="cursor-pointer"
          >
            <ExternalLink className="h-4 w-4 opacity-60" />
            Vincular tarea
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setOpenDialog(true)}
            className="cursor-pointer"
          >
            <Edit className="h-4 w-4 opacity-60" />
            <span>Editar</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              console.log("Ver tareas vinculadas: ", {
                interactionId,
              });
              setOpenLinkedTasks(true);
            }}
            className="cursor-pointer"
          >
            <ClipboardList className="opacity-60 h-4 w-4" />
            Ver tareas
          </DropdownMenuItem>
          <ConfirmDialog
            title="¿De verdad deseas eliminar la interacción?"
            description="La interacción será eliminada de forma permanente y no podrás restablecerla."
            trigger={
              <div className="text-red-500 cursor-pointer flex items-center p-1  text-sm  rounded-sm hover:bg-gray-100">
                <Trash2 className="h-4 w-4 ml-1 items-center" />
                <span className="ml-2">Eliminar</span>
              </div>
            }
            onConfirm={async () => deleteInteraction(interactionId)}
          />
        </DropdownMenuContent>
      </DropdownMenu>
      {/* Diálogo para crear tarea */}
      <CreateTaskDialog
        interactionId={interactionId}
        open={openCreateTask}
        onOpenChange={setOpenCreateTask}
        onTaskCreated={() => {
          toast.success("Tarea creada exitosamente");
          setOpenCreateTask(false);
        }}
      />
      {/* Diálogo para ver tareas vinculadas */}
      <LinkedTasksDialog
        interactionId={interactionId}
        open={openLinkedTasks}
        onOpenChange={setOpenLinkedTasks}
      />
    </>
  );
};

// Nueva interfaz para el diálogo de crear tarea
interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated?: () => void;
  interactionId: string;
}

// Componente para crear tareas desde el seguimiento
const CreateTaskDialog = ({
  open,
  onOpenChange,
  interactionId,
  onTaskCreated,
}: CreateTaskDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Cargar usuarios cuando se abre el diálogo
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

  // Función para manejar la selección de fecha
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  // Función para resetear el formulario
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate(new Date());
    setNotificationsEnabled(false);
    setSelectedUsers([]);
    setIsSubmitting(false);
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Por favor, añade un título para la tarea");
      return;
    }

    if (!description.trim()) {
      toast.error("Por favor añade una descripción para la tarea");
      return;
    }

    if (!dueDate) {
      toast.error("Por favor, selecciona una fecha límite");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = createTaskFromContactInteractionLinked({
        title,
        description,
        dueDate: dueDate.toISOString(),
        interactionId,
        notifyOnComplete: notificationsEnabled,
        notificationRecipients: selectedUsers,
      });

      toast.promise(result, {
        loading: "Loading...",
        success: () => {
          return "Tarea creada correctamente";
        },
        error: "Error",
      });

      // Limpiar el formulario
      resetForm();

      // Llamar la función de callback
      onTaskCreated?.();
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Error al crear la tarea");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para manejar el cambio de estado del diálogo
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  // Función para remover un usuario de la lista
  const removeUser = (userIdToRemove: string) => {
    setSelectedUsers(selectedUsers.filter((id) => id !== userIdToRemove));
  };

  const canSubmit =
    title.trim() && description.trim() && dueDate && !isSubmitting;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5" />
            Nueva tarea vinculada
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Título de la tarea</Label>
            <Input
              id="task-title"
              placeholder="Ej: Enviar seguimiento por WhatsApp"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">Descripción</Label>
            <Textarea
              id="task-description"
              placeholder="Describe los detalles de la tarea..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              required
              className="resize-none min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-dueDate">Fecha límite</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal w-full",
                    !dueDate && "text-muted-foreground"
                  )}
                  disabled={isSubmitting}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {dueDate ? (
                    format(dueDate, "d 'de' MMMM, yyyy", { locale: es })
                  ) : (
                    <span>Selecciona una fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                <CalendarComponent
                  mode="single"
                  selected={dueDate}
                  onSelect={handleDateSelect}
                  locale={es}
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <div className="border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2">
                <Switch
                  id="task-notifications"
                  className="order-1 h-4 w-6 after:absolute after:inset-0 [&_span]:size-3 data-[state=checked]:[&_span]:translate-x-2 data-[state=checked]:[&_span]:rtl:-translate-x-2"
                  aria-describedby="task-notifications-description"
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                  disabled={isSubmitting}
                />
                <div className="flex grow items-center gap-3">
                  <BellRing aria-hidden="true" />
                  <div className="grid grow gap-2">
                    <Label htmlFor="task-notifications">
                      Notificar{" "}
                      <span className="text-muted-foreground text-xs leading-[inherit] font-normal">
                        (Al completar)
                      </span>
                    </Label>
                    <p
                      id="task-notifications-description"
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
                <Label htmlFor="task-user-select">
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
                  <SelectTrigger id="task-user-select">
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

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!canSubmit} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear tarea
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Componente para el footer con el archivo adjunto
const AttachmentFooter = ({
  attachmentUrl,
  attachmentName,
}: {
  attachmentUrl: string;
  attachmentName: string | null;
}) => {
  const getFileIcon = () => {
    const fileType = attachmentUrl.split(".").pop()?.toLowerCase() || "";
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(fileType))
      return "🖼️";
    if (fileType === "pdf") return "📄";
    if (["doc", "docx"].includes(fileType)) return "📝";
    if (["xls", "xlsx", "csv"].includes(fileType)) return "📊";
    if (["mp4", "webm", "avi", "mov"].includes(fileType)) return "🎬";
    if (["mp3", "wav", "ogg"].includes(fileType)) return "🎵";
    return "📎";
  };

  return (
    <CardFooter className="py-3 px-4 bg-slate-50 dark:bg-slate-900/30 rounded-b-lg flex items-center gap-2">
      <span className="text-lg">{getFileIcon()}</span>
      <a
        href={attachmentUrl}
        download={attachmentName || true}
        className="flex flex-1 items-center gap-2 text-sm text-primary hover:underline group"
        target="_blank"
      >
        <span className="truncate max-w-[200px]">
          {attachmentName || "Archivo adjunto"}
        </span>
        <Download className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
      </a>
    </CardFooter>
  );
};

// Componente para el diálogo de edición
const EditInteractionDialog = ({
  open,
  setOpen,
  isPending,
  newContent,
  setNewContent,
  attachmentInfo,
  interaction,
  handleSubmit,
  handleNewFileChange,
  handleDeleteFile,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  isPending: boolean;
  newContent: string;
  setNewContent: (content: string) => void;
  attachmentInfo: Attachment | null;
  interaction: ContactInteractionWithRelations;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleNewFileChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => Promise<void>;
  handleDeleteFile: () => void;
}) => {
  const getFileIcon = () => {
    const fileType = attachmentInfo?.attachmentType || "";
    if (fileType.includes("image")) return "🖼️";
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("word") || fileType.includes("document")) return "📝";
    if (fileType.includes("excel") || fileType.includes("sheet")) return "📊";
    if (fileType.includes("video")) return "🎬";
    if (fileType.includes("audio")) return "🎵";
    return "📎";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Editar Interacción</DialogTitle>
          <DialogDescription>
            Modifica el contenido o los archivos adjuntos de esta interacción
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="content">Contenido</Label>
            <Textarea
              id="content"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Escribe el contenido de la interacción..."
              className="min-h-[100px] resize-none"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <PaperclipIcon className="h-4 w-4" />
              Archivo adjunto
            </Label>

            {attachmentInfo ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm bg-muted/50 px-3 py-3 rounded-md">
                  <span className="text-lg">{getFileIcon()}</span>
                  <span className="truncate flex-1 max-w-[200px]">
                    <a
                      className="underline"
                      href={attachmentInfo.attachmentUrl}
                      target="_blank"
                    >
                      {attachmentInfo.attachmentName}
                    </a>
                  </span>
                  <div className="flex gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <ConfirmDialog
                            title="¿Seguro que desea eliminar el archivo?"
                            description="Esta acción no puede deshacerse y eliminará permanentemente el archivo."
                            onConfirm={async () => handleDeleteFile()}
                            trigger={
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8"
                                type="button"
                                disabled={isPending}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            }
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Eliminar archivo</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            ) : (
              <FileUploadArea
                isPending={isPending}
                handleNewFileChange={handleNewFileChange}
              />
            )}
          </div>

          <DialogFooter className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              type="button"
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending || newContent === ""}
              className="relative"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>Guardar cambios</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Componente para el área de carga de archivos
const FileUploadArea = ({
  isPending,
  handleNewFileChange,
}: {
  isPending: boolean;
  handleNewFileChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => Promise<void>;
}) => {
  return (
    <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-4 text-center">
      <Label
        htmlFor="new-file"
        className={cn(
          "cursor-pointer",
          isPending && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className="flex flex-col items-center gap-2 py-4">
          <UploadCloud className="h-8 w-8 text-muted-foreground/70" />
          <p className="text-sm font-medium">
            Arrastra un archivo o haz clic para seleccionar
          </p>
          <p className="text-xs text-muted-foreground">
            Subir archivo adjunto (PDF, imágenes, documentos)
          </p>
        </div>
        <input
          type="file"
          id="new-file"
          className="hidden"
          onChange={handleNewFileChange}
          disabled={isPending}
        />
      </Label>
    </div>
  );
};

// Funciones auxiliares
const handleDeleteInteraction = async (
  interactionId: string,
  setInteractions: React.Dispatch<
    React.SetStateAction<ContactInteractionWithRelations[]>
  >,
  updateLeadInState?: (
    leadId: string,
    updates: Partial<LeadWithRelations>
  ) => void,
  interaction?: ContactInteractionWithRelations
) => {
  try {
    await deleteInteractionById(interactionId);
    setInteractions((prev) => prev.filter((i) => i.id !== interactionId));

    // Actualizar el estado global si la función está disponible
    if (updateLeadInState && interaction?.contacto.leadId) {
      try {
        const updatedContacts = await getContactosByLeadId(
          interaction.contacto.leadId
        );
        updateLeadInState(interaction.contacto.leadId, {
          contactos: updatedContacts,
        });
      } catch (error) {
        console.error("Error al actualizar el estado global:", error);
      }
    }
  } catch (error) {
    console.error("Error deleting interaction:", error);
    toast.error("Error al eliminar la interacción");
  }
};

const handleSubmit = async (
  e: React.FormEvent<HTMLFormElement>,
  newContent: string,
  attachmentInfo: Attachment | null,
  isAttachmentChanged: boolean,
  interaction: ContactInteractionWithRelations,
  setInteractions: React.Dispatch<
    React.SetStateAction<ContactInteractionWithRelations[]>
  >,
  setIsPending: React.Dispatch<React.SetStateAction<boolean>>,
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>,
  setIsAttachmentChanged: React.Dispatch<React.SetStateAction<boolean>>,
  updateLeadInState?: (
    leadId: string,
    updates: Partial<LeadWithRelations>
  ) => void
) => {
  e.preventDefault();
  setIsPending(true);

  const formData = new FormData();
  formData.append("content", newContent);

  if (attachmentInfo && isAttachmentChanged) {
    formData.append("attachment", JSON.stringify(attachmentInfo));
  } else if (!attachmentInfo && interaction.attachmentUrl) {
    formData.append("removeAttachment", "true");
  }

  try {
    const interactionUpdated = await editInteractionById(
      interaction.id,
      formData
    );

    if (!interactionUpdated) {
      toast.error("La interacción no se pudo actualizar");
      return;
    }

    setInteractions((prevItems) =>
      prevItems.map((item) =>
        item.id === interaction.id
          ? {
              ...item,
              content: newContent,
              attachmentUrl: attachmentInfo?.attachmentUrl || null,
              attachmentName: attachmentInfo?.attachmentName || null,
              attachmentType: attachmentInfo?.attachmentType || null,
              updatedAt: new Date(),
            }
          : item
      )
    );

    setIsAttachmentChanged(false);
    toast.success("Interacción actualizada correctamente");

    // Actualizar el estado global si la función está disponible
    if (updateLeadInState && interaction.contacto.leadId) {
      try {
        const updatedContacts = await getContactosByLeadId(
          interaction.contacto.leadId
        );
        updateLeadInState(interaction.contacto.leadId, {
          contactos: updatedContacts,
        });
      } catch (error) {
        console.error("Error al actualizar el estado global:", error);
      }
    }
  } catch (err) {
    console.error(err);
    toast.error("Algo salió mal al actualizar la interacción");
  } finally {
    setIsPending(false);
    setOpenDialog(false);
  }
};

const handleNewFileChange = async (
  e: React.ChangeEvent<HTMLInputElement>,
  setIsPending: React.Dispatch<React.SetStateAction<boolean>>,
  setAttachmentInfo: React.Dispatch<React.SetStateAction<Attachment | null>>,
  setIsAttachmentChanged: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    setIsPending(true);
    const formData = new FormData();
    formData.append("file", file);

    toast.loading("Subiendo archivo...");
    const attachment = await uploadFile(formData);

    if (attachment.success) {
      setAttachmentInfo({
        attachmentName: attachment.fileName,
        attachmentType: attachment.fileType,
        attachmentUrl: attachment.url,
      });
      setIsAttachmentChanged(true);
      toast.dismiss();
      toast.success("Archivo subido correctamente");
    } else {
      toast.dismiss();
      toast.error("Error al subir el archivo");
    }
  } catch (error) {
    console.error("Error al subir el archivo:", error);
    toast.dismiss();
    toast.error("Error al subir el archivo");
  } finally {
    setIsPending(false);
  }
};

// Función para eliminar completamente un archivo (fuera del contexto de edición)
const handleDeleteFileCompletely = async (
  fileName: string,
  interactionId: string,
  setAttachmentInfo: React.Dispatch<React.SetStateAction<Attachment | null>>,
  setInteractions: React.Dispatch<
    React.SetStateAction<ContactInteractionWithRelations[]>
  >
) => {
  if (!fileName || fileName.length < 5) {
    throw new Error("");
  }

  const fileKey = fileName.split("/").pop();

  if (!fileKey) {
    console.log({ fileKey });
    throw new Error("File key error");
  }

  const { ok, message } = await deleteFile(fileKey, interactionId);

  if (!ok) {
    toast.error(message);
    return;
  }

  toast.success(message);
  setAttachmentInfo(null);

  setInteractions((prevItems) =>
    prevItems.map((item) =>
      item.id === interactionId
        ? {
            ...item,
            attachmentUrl: null,
            attachmentName: null,
            attachmentType: null,
          }
        : item
    )
  );
};

// Componente para ver tareas vinculadas a una interacción
interface LinkedTasksDialogProps {
  interactionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LinkedTasksDialog = ({
  interactionId,
  open,
  onOpenChange,
}: LinkedTasksDialogProps) => {
  const [tasks, setTasks] = useState<TaskWithUsers[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar las tareas vinculadas
  const loadLinkedTasks = useCallback(async () => {
    if (!interactionId || !open) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getTasksByInteractionId(interactionId);
      setTasks(data);
    } catch (err) {
      console.error("Error al obtener tareas vinculadas:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [interactionId, open]);

  // Cargar tareas cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      loadLinkedTasks();
    }
  }, [open, interactionId, loadLinkedTasks]);

  // Función para obtener el estado visual de la tarea
  const getTaskStatusInfo = (task: TaskWithUsers) => {
    const isTaskDone = task.status === "Done";

    if (isTaskDone) {
      return {
        borderColor: "border-l-emerald-400",
        bgColor: "",
        textColor: "",
        icon: <CheckCircle className="w-4 h-4 text-emerald-500" />,
        label: "Completada",
      };
    }

    const today = new Date();
    const dueDate = new Date(task.dueDate);
    const timeDiff = dueDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysLeft > 5) {
      return {
        borderColor: "border-l-blue-500",
        bgColor: "",
        textColor: "",
        icon: <Clock className="w-4 h-4 text-blue-500" />,
        label: `${daysLeft} días restantes`,
      };
    } else if (daysLeft >= 3) {
      return {
        borderColor: "border-l-amber-400",
        bgColor: "",
        textColor: "",
        icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
        label: `${daysLeft} días restantes`,
      };
    } else {
      return {
        borderColor: "border-l-red-500",
        bgColor: "bg-red-50",
        textColor: "text-red-700",
        icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
        label: daysLeft < 0 ? "Vencida" : `${daysLeft} días restantes`,
      };
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-w-[95vw] w-full max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Tareas vinculadas
          </DialogTitle>
          <DialogDescription>
            Tareas que han sido vinculadas a esta interacción
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">
                Cargando tareas...
              </span>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <p>Error: {error}</p>
              <Button
                variant="outline"
                onClick={loadLinkedTasks}
                className="mt-4"
              >
                Reintentar
              </Button>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No hay tareas vinculadas</p>
              <p className="text-sm">
                Esta interacción no tiene tareas vinculadas. Para crear una
                tarea, usa la opción Vincular tarea.
              </p>
            </div>
          ) : (
            <div className="pt-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-4 pr-4">
                  {tasks.map((task) => {
                    const statusInfo = getTaskStatusInfo(task);
                    return (
                      <Card
                        key={task.id}
                        className={cn(
                          "border-l-4 transition-colors hover:bg-muted/50",
                          statusInfo.borderColor,
                          statusInfo.bgColor
                        )}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-base font-medium">
                                {task.title}
                              </CardTitle>
                              <CardDescription className="text-sm mt-1">
                                {task.description}
                              </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                              {statusInfo.icon}
                              <Badge variant="secondary" className="text-xs">
                                {statusInfo.label}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <span>Asignada a:</span>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage
                                    src={task.assignedTo.image || ""}
                                    alt={task.assignedTo.name}
                                  />
                                  <AvatarFallback className="text-xs">
                                    {task.assignedTo.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">
                                  {task.assignedTo.name}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {format(
                                  new Date(task.dueDate),
                                  "d 'de' MMMM, yyyy",
                                  { locale: es }
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Mostrar usuarios que reciben notificaciones */}
                          {task.notificationRecipients.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-muted/20">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs text-muted-foreground">
                                  Notificar a:
                                </span>
                              </div>
                              <div
                                className="flex -space-x-2"
                                role="group"
                                aria-label="Usuarios que serán notificados"
                              >
                                {task.notificationRecipients.map((user) => (
                                  <Tooltip key={user.id}>
                                    <TooltipTrigger asChild>
                                      <Link
                                        href={`/profile/${user.id}`}
                                        className=""
                                        tabIndex={0}
                                      >
                                        <Image
                                          className="ring-background rounded-full ring-2"
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
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
