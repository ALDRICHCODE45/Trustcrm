"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Loader2,
  MessageSquare,
  Users,
  Calendar,
  User,
  FileText,
  Download,
  PaperclipIcon,
  MoreVertical,
  ClipboardList,
  CheckCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";
import {
  ContactInteractionWithRelations,
  getAllInteractionsByLeadId,
  getTasksByInteractionId,
  TaskWithUsers,
} from "@/actions/leadSeguimiento/ations";
import { Button } from "@/components/ui/button";
import { cn } from "@/core/lib/utils";
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
import Image from "next/image";
import Link from "next/link";

interface AllLeadInteractionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  empresaName: string;
}

export function AllLeadInteractionsDialog({
  open,
  onOpenChange,
  leadId,
  empresaName,
}: AllLeadInteractionsDialogProps) {
  const [interactions, setInteractions] = useState<
    ContactInteractionWithRelations[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Estado para manejar múltiples diálogos de tareas vinculadas
  const [openLinkedTasksDialogs, setOpenLinkedTasksDialogs] = useState<
    Record<string, boolean>
  >({});

  const fetchInteractions = useCallback(async () => {
    if (!leadId || !open) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getAllInteractionsByLeadId(leadId);
      setInteractions(data);
    } catch (err) {
      console.error("Error al obtener interacciones:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [leadId, open]);

  useEffect(() => {
    fetchInteractions();
  }, [fetchInteractions]);

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `hace ${diffInSeconds} segundos`;

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `hace ${diffInMinutes} minutos`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `hace ${diffInHours} horas`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `hace ${diffInDays} días`;

    // Si es más de una semana, mostrar la fecha formateada
    return format(date, "eee dd/MM/yyyy", { locale: es });
  };

  const groupedInteractions = interactions.reduce((acc, interaction) => {
    const contactName = interaction.contacto.name;
    if (!acc[contactName]) {
      acc[contactName] = [];
    }
    acc[contactName].push(interaction);
    return acc;
  }, {} as Record<string, ContactInteractionWithRelations[]>);

  // Ordenar las interacciones de cada contacto por fecha (más recientes primero)
  Object.keys(groupedInteractions).forEach((contactName) => {
    groupedInteractions[contactName].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  });

  // Ordenar los contactos por la interacción más reciente
  const sortedContactNames = Object.keys(groupedInteractions).sort((a, b) => {
    const latestA = groupedInteractions[a][0]?.createdAt || "";
    const latestB = groupedInteractions[b][0]?.createdAt || "";
    return new Date(latestB).getTime() - new Date(latestA).getTime();
  });

  const totalInteractions = interactions.length;
  const totalContacts = Object.keys(groupedInteractions).length;

  // Función para manejar el estado de los diálogos de tareas vinculadas
  const handleLinkedTasksDialogChange = (
    interactionId: string,
    open: boolean
  ) => {
    setOpenLinkedTasksDialogs((prev) => ({
      ...prev,
      [interactionId]: open,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-w-[95vw] w-full max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Todas las interacciones - {empresaName}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {totalContacts} contactos
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              {totalInteractions} interacciones
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 px-6 pb-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">
                Cargando interacciones...
              </span>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <p>Error: {error}</p>
              <Button
                variant="outline"
                onClick={fetchInteractions}
                className="mt-4"
              >
                Reintentar
              </Button>
            </div>
          ) : totalInteractions === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">
                No hay interacciones registradas
              </p>
              <p className="text-sm">
                Los contactos de esta empresa aún no tienen interacciones
                registradas. Para agregar una interacción, ve a la sección de
                contactos y haz clic en &quot;Seguimiento&quot;.
              </p>
            </div>
          ) : (
            <div className="pt-4">
              <ScrollArea className="h-[500px]">
                <div className="space-y-6 pr-4">
                  {sortedContactNames.map((contactName) => (
                    <div key={contactName} className="space-y-3">
                      {/* Header del contacto */}
                      <div className="flex items-center gap-2 pb-2 border-b">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-semibold text-base">
                          {contactName}
                        </h3>
                        <Badge variant="secondary" className="ml-auto">
                          {groupedInteractions[contactName].length}{" "}
                          interacciones
                        </Badge>
                      </div>

                      {/* Interacciones del contacto */}
                      <div className="space-y-3 pl-4">
                        {groupedInteractions[contactName].map((interaction) => (
                          <div
                            key={interaction.id}
                            className={cn(
                              "border-l-4 bg-card rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow relative group",
                              interaction.attachmentUrl
                                ? "border-l-blue-500"
                                : "border-l-primary"
                            )}
                          >
                            {/* Header de la interacción */}
                            <div className="flex items-center gap-3 mb-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={interaction.autor.image || ""}
                                  className="object-cover"
                                />
                                <AvatarFallback className="text-xs bg-primary/10">
                                  {interaction.autor.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground">
                                  {interaction.autor.name}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  <span>
                                    {getTimeAgo(
                                      new Date(interaction.createdAt)
                                    )}
                                  </span>
                                </div>
                              </div>

                              {/* Dropdown de opciones */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="z-[999]"
                                >
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleLinkedTasksDialogChange(
                                        interaction.id,
                                        true
                                      )
                                    }
                                    className="cursor-pointer"
                                  >
                                    <ClipboardList className="opacity-60 h-4 w-4 mr-2" />
                                    Ver tareas vinculadas
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            {/* Contenido de la interacción */}
                            <div className="mb-3">
                              <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                                {interaction.content}
                              </p>
                            </div>

                            {/* Archivo adjunto si existe */}
                            {interaction.attachmentUrl && (
                              <div className="bg-muted/50 rounded-md p-3 border border-muted">
                                <div className="flex items-center gap-2">
                                  <PaperclipIcon className="h-4 w-4 text-blue-500" />
                                  <span className="text-sm text-muted-foreground">
                                    Archivo adjunto:
                                  </span>
                                  <a
                                    href={interaction.attachmentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:text-blue-800 underline font-medium"
                                  >
                                    {interaction.attachmentName ||
                                      "Ver archivo"}
                                  </a>
                                  <a
                                    href={interaction.attachmentUrl}
                                    download={interaction.attachmentName}
                                    className="ml-auto p-1 hover:bg-muted rounded-md transition-colors"
                                  >
                                    <Download className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                  </a>
                                </div>
                              </div>
                            )}

                            {/* Diálogo para ver tareas vinculadas */}
                            <LinkedTasksMiniDialog
                              interactionId={interaction.id}
                              open={
                                openLinkedTasksDialogs[interaction.id] || false
                              }
                              onOpenChange={(open) =>
                                handleLinkedTasksDialogChange(
                                  interaction.id,
                                  open
                                )
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Componente para mostrar tareas vinculadas en un diálogo compacto
interface LinkedTasksMiniDialogProps {
  interactionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LinkedTasksMiniDialog = ({
  interactionId,
  open,
  onOpenChange,
}: LinkedTasksMiniDialogProps) => {
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
      <DialogContent className="sm:max-w-lg max-w-[95vw] w-full max-h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Tareas vinculadas
          </DialogTitle>
          <DialogDescription>
            Tareas vinculadas a esta interacción
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">
                Cargando tareas...
              </span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>Error: {error}</p>
              <Button
                variant="outline"
                onClick={loadLinkedTasks}
                className="mt-2"
                size="sm"
              >
                Reintentar
              </Button>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ClipboardList className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">No hay tareas vinculadas</p>
              <p className="text-xs">
                Esta interacción no tiene tareas vinculadas.
              </p>
            </div>
          ) : (
            <div className="pt-2">
              <ScrollArea className="h-[300px]">
                <div className="space-y-3 pr-4">
                  {tasks.map((task) => {
                    const statusInfo = getTaskStatusInfo(task);
                    return (
                      <div
                        key={task.id}
                        className={cn(
                          "border-l-4 bg-card rounded-lg p-3 shadow-sm transition-colors hover:bg-muted/50",
                          statusInfo.borderColor,
                          statusInfo.bgColor
                        )}
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium">
                              {task.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {statusInfo.icon}
                            <Badge variant="secondary" className="text-xs">
                              {statusInfo.label}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                          <div className="flex items-center gap-2">
                            <span>Asignada a:</span>
                            <div className="flex items-center gap-1">
                              <Avatar className="h-5 w-5">
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
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {format(new Date(task.dueDate), "dd/MM/yyyy", {
                                locale: es,
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Mostrar usuarios que reciben notificaciones */}
                        {task.notificationRecipients.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-muted/20">
                            <div className="flex items-center gap-1 mb-1">
                              <span className="text-xs text-muted-foreground">
                                Notificar a:
                              </span>
                            </div>
                            <div
                              className="flex -space-x-1"
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
                                        className="ring-background rounded-full ring-1"
                                        src={user.image ?? "/default2.png"}
                                        width={20}
                                        height={20}
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
                      </div>
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
