"use client";
import { useState, useCallback, useEffect } from "react";
import {
  Mail,
  MoreVertical,
  Edit,
  Trash2,
  Loader2,
  GalleryHorizontalEnd,
  MessageSquare,
  PaperclipIcon,
  FileText,
  X,
  Plus,
  History,
  Phone,
  Calendar,
  CalendarPlus,
  CircleUser,
  Tag,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LeadStatus, Person, Prisma } from "@prisma/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { deleteContactById, editLeadPerson } from "@/actions/person/actions";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ContactInteractionWithRelations,
  createInteraction,
  getContactosByLeadId,
} from "@/actions/leadSeguimiento/ations";
import { InteractionCard } from "./InteractionCard";
import { uploadFile } from "@/actions/files/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, set } from "date-fns";
import { es } from "date-fns/locale";
import { createTaskFromContact } from "@/actions/tasks/actions";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LeadWithRelations } from "../kanban/page";
import { ToastCustomMessage } from "@/components/ToastCustomMessage";
import { addEtiqueta } from "@/actions/leads/actions";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/core/lib/utils";

const getEtiquetaColor = (etiqueta: LeadStatus | "none") => {
  switch (etiqueta) {
    case LeadStatus.ContactoCalido:
      return "bg-blue-500 text-white";
    case LeadStatus.SocialSelling:
      return "bg-green-500 text-white";
    case LeadStatus.CitaAgendada:
      return "bg-yellow-500 text-white";
    case LeadStatus.CitaAtendida:
      return "bg-red-500 text-white";
    case LeadStatus.CitaValidada:
      return "bg-purple-500 text-white";
    case LeadStatus.Asignadas:
      return "bg-orange-500 text-white";
    case LeadStatus.StandBy:
      return "bg-gray-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

// Definición de tipos
interface ContactoCardProps {
  contacto: ContactWithRelations;
  onUpdateContacts: React.Dispatch<
    React.SetStateAction<ContactWithRelations[]>
  >;
  updateLeadInState?: (
    leadId: string,
    updates: Partial<LeadWithRelations>
  ) => void;
}

export type ContactWithRelations = Prisma.PersonGetPayload<{
  include: {
    interactions: {
      include: {
        autor: true;
        contacto: true;
        linkedTasks: true;
      };
    };
  };
}>;

async function createContactInteraction(
  contactoId: string,
  content: string,
  attachment?: Attachment
) {
  try {
    const formData = new FormData();
    formData.append("contactoId", contactoId);
    formData.append("content", content);

    if (attachment) {
      formData.append("attachment", JSON.stringify(attachment));
    }

    const response = await createInteraction(formData);

    return response;
  } catch (error) {
    console.error("Error creating interaction:", error);
    throw new Error("Error al crear la interacción");
  }
}

export const ContactoCard = ({
  contacto,
  onUpdateContacts,
  updateLeadInState,
}: ContactoCardProps) => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [openSeguimiento, setOpenSeguimiento] = useState<boolean>(false);
  const [openDelete, setIsOpenDelete] = useState(false);

  useEffect(() => {
    console.log("interactions", contacto.name, contacto.interactions);
  }, [contacto.interactions, contacto.name]);

  const [etiqueta, setEtiqueta] = useState<LeadStatus | "none">(
    contacto.etiqueta ?? "none"
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsPending(true);

      const formData = new FormData(e.currentTarget);

      try {
        await editLeadPerson(contacto.id, formData);
        toast.success("Contacto editado con exito");

        // Extraer los nuevos valores del formulario
        const newName = formData.get("name") as string;
        const newPosition = formData.get("position") as string;
        const newEmail = (formData.get("email") as string) || null;
        const newPhone = (formData.get("phone") as string) || null;
        const newLinkedin = (formData.get("linkedin") as string) || null;

        // Crear el contacto actualizado
        const updatedContacto: ContactWithRelations = {
          ...contacto,
          name: newName,
          position: newPosition,
          email: newEmail,
          phone: newPhone,
          linkedin: newLinkedin,
        };

        // Actualizar la lista de contactos reemplazando el contacto editado
        onUpdateContacts((prev) =>
          prev.map((contact) =>
            contact.id === contacto.id ? updatedContacto : contact
          )
        );
      } catch (error) {
        toast.error("Algo salio mal..");
      } finally {
        setIsPending(false);
        setOpenDialog(false);
      }
    },
    [onUpdateContacts, contacto]
  );

  const handleAddEtiqueta = useCallback(
    async (newEtiqueta: LeadStatus | "none") => {
      try {
        const response = await addEtiqueta(contacto.id, newEtiqueta);
        if (!response.ok) {
          toast.custom((t) => (
            <ToastCustomMessage
              title="Error"
              onClick={() => {
                toast.dismiss(t);
              }}
              message={response.message}
              type="error"
            />
          ));
          return;
        }

        toast.custom((t) => (
          <ToastCustomMessage
            title="Etiqueta agregada"
            message={response.message}
            type="success"
            onClick={() => {
              toast.dismiss(t);
            }}
          />
        ));
      } catch (error) {
        console.error("Error adding etiqueta:", error);
        toast.custom((t) => (
          <ToastCustomMessage
            title="Error"
            message="Ah ocurrido un error"
            type="error"
            onClick={() => {
              toast.dismiss(t);
            }}
          />
        ));
      }
    },
    [contacto]
  );

  const deleteContact = useCallback(
    async (id: string) => {
      try {
        const promise = deleteContactById(id);

        toast.promise(promise, {
          loading: "Eliminando...",
          success: () => {
            // Actualizar la lista local eliminando el contacto
            onUpdateContacts((prev) =>
              prev.filter((contact) => contact.id !== id)
            );
            return "Contacto eliminado con exito";
          },
          error: "Ah ocurrido un error",
        });
      } catch (error) {
        console.log(error);
        throw Error("Error eliminando leadContact");
      }
    },
    [onUpdateContacts]
  );

  return (
    <>
      <Card className="shadow-sm hover:shadow-md transition-shadow border-l-2 border-l-primary">
        <CardHeader className="p-3 pb-1 flex flex-row justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-base font-medium">
              {contacto.name}
            </CardTitle>
            <CardDescription className="text-xs text-gray-400">
              {contacto.position}
            </CardDescription>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-[9999]">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer flex items-center gap-2">
                  <Tag />
                  <span>Etiqueta</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="z-[9999]">
                    <DropdownMenuRadioGroup
                      value={etiqueta}
                      onValueChange={async (value) => {
                        const newEtiqueta = value as LeadStatus | "none";
                        setEtiqueta(newEtiqueta);
                        await handleAddEtiqueta(newEtiqueta);
                      }}
                    >
                      <DropdownMenuRadioItem value="none">
                        Sin etiqueta
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value={LeadStatus.ContactoCalido}>
                        Contacto calido
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value={LeadStatus.SocialSelling}>
                        Social selling
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value={LeadStatus.CitaAgendada}>
                        Cita agendada
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value={LeadStatus.CitaAtendida}>
                        Cita atendida
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value={LeadStatus.CitaValidada}>
                        Cita validada
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value={LeadStatus.Asignadas}>
                        Asignadas
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value={LeadStatus.StandBy}>
                        Stand by
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuItem
                onClick={() => setOpenSeguimiento(true)}
                className="text-blue-500 cursor-pointer "
              >
                <GalleryHorizontalEnd />
                <span>Seguimiento</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => setOpenDialog(true)}
                className="cursor-pointer"
              >
                <Edit />
                <span>Editar</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <AlertDialog open={openDelete} onOpenChange={setIsOpenDelete}>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="cursor-pointer"
                    variant="destructive"
                  >
                    <Trash2 className=" h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Se eliminará
                      permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setIsOpenDelete(false)}>
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteContact(contacto.id)}
                    >
                      Sí, eliminar.
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="p-3 pt-1 space-y-2">
          <div className="flex items-center gap-2 justify-between">
            <div className="flex flex-col gap-1 items-start">
              <div className="flex gap-1 items-center">
                <Mail size={14} className="text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {contacto.email ? contacto.email : "Sin email"}
                </p>
              </div>
              <div className="flex gap-1 items-center">
                <Phone size={14} className="text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {contacto.phone ? contacto.phone : "Sin celular"}
                </p>
              </div>

              <div className="flex gap-1 items-center">
                <CircleUser size={14} className="text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {contacto.linkedin ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          className="underline text-blue-500"
                          href={contacto.linkedin}
                          target="_blank"
                        >
                          Perfil de Linkedin
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <span>{contacto.linkedin}</span>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    "Sin Linkedin"
                  )}
                </p>
              </div>
              <div className="flex gap-1 items-center mt-2">
                <Badge variant="outline" className={getEtiquetaColor(etiqueta)}>
                  {etiqueta === "none" ? "Ninguna" : etiqueta}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <SeguimientoContacto
        initialInteractions={contacto.interactions ?? []}
        onOpenChange={setOpenSeguimiento}
        open={openSeguimiento}
        contacto={contacto}
        updateLeadInState={updateLeadInState}
      />

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar contacto</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1 space-y-2">
                <Label htmlFor="nombre">Nombre completo</Label>
                <Input
                  name="name"
                  id="name"
                  placeholder="Juan Pérez"
                  type="text"
                  required
                  defaultValue={contacto.name}
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="puesto">Puesto</Label>
                <Input
                  id="position"
                  name="position"
                  placeholder="Gerente de producto"
                  type="text"
                  required
                  defaultValue={contacto.position!!}
                />
              </div>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1 space-y-2">
                <Label htmlFor="correo">Correo electrónico</Label>
                <Input
                  id="email"
                  name="email"
                  defaultValue={contacto.email ?? ""}
                  placeholder="@ejemplo.com"
                  type="email"
                  required={false}
                />
              </div>

              <div className="flex-1 space-y-2">
                <Label htmlFor="phone">Celular</Label>
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={contacto.phone ?? ""}
                  placeholder="+52 5532.."
                  type="tel"
                  required={false}
                />
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <Label htmlFor="phone">Linkedin</Label>
              <Input
                id="linkedin"
                name="linkedin"
                defaultValue={contacto.linkedin ?? ""}
                placeholder="linkedin/aldrich.."
                type="text"
                required={false}
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setOpenDialog(false)}
                type="button"
              >
                Cancelar
              </Button>
              <Button type="submit">
                {isPending ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Cargando...
                  </>
                ) : (
                  <span>Guardar cambios</span>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

interface SeguimientoContactoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contacto: Person;
  initialInteractions: ContactInteractionWithRelations[];
  updateLeadInState?: (
    leadId: string,
    updates: Partial<LeadWithRelations>
  ) => void;
}

export interface Attachment {
  attachmentUrl: string;
  attachmentName: string;
  attachmentType: string;
}

// Nueva interfaz para el diálogo de crear tarea
interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated?: () => void;
}

export const SeguimientoContacto = ({
  open,
  onOpenChange,
  contacto,
  initialInteractions,
  updateLeadInState,
}: SeguimientoContactoProps) => {
  const [interactions, setInteractions] =
    useState<ContactInteractionWithRelations[]>(initialInteractions);
  useEffect(() => {
    console.log("initialInteractions", initialInteractions);
  }, [initialInteractions]);

  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [newContent, setNewContent] = useState<string>("");
  const [attachment, setAttachment] = useState<Attachment | null>(null);

  // Estado para el diálogo de crear tarea
  const [openCreateTask, setOpenCreateTask] = useState<boolean>(false);

  // Manejar el envío del formulario
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!newContent.trim()) {
        toast.error("El contenido no puede estar vacío");
        return;
      }

      setSubmitting(true);

      try {
        const newInteraction = await createContactInteraction(
          contacto.id,
          newContent,
          attachment || undefined
        );

        setInteractions((prev) => [...prev, newInteraction]);
        setNewContent("");
        setAttachment(null);
        toast.success("Interacción registrada con éxito");

        // Actualizar el estado global si la función está disponible
        if (updateLeadInState && contacto.leadId) {
          // Obtener los contactos actualizados del lead
          try {
            const updatedContacts = await getContactosByLeadId(contacto.leadId);
            updateLeadInState(contacto.leadId, {
              contactos: updatedContacts,
            });
          } catch (error) {
            console.error("Error al actualizar el estado global:", error);
          }
        }
      } catch (error) {
        toast.error("Error al registrar la interacción");
      } finally {
        setSubmitting(false);
      }
    },
    [contacto.id, contacto.leadId, newContent, attachment, updateLeadInState]
  );

  // Manejar selección de archivo
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Crear el FormData y agregar el archivo
      const formData = new FormData();
      formData.append("file", file);

      const attachment = await uploadFile(formData);

      if (attachment.success) {
        setAttachment({
          attachmentName: attachment.fileName,
          attachmentType: attachment.fileType,
          attachmentUrl: attachment.url,
        });
      }
    },
    []
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-w-[95vw] w-full max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Seguimiento de contacto: {contacto.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 w-full flex-1 min-h-0 overflow-hidden">
          {/* Formulario para agregar nueva interacción */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="content">Nueva interacción</Label>
              <Textarea
                id="content"
                placeholder="Describe la interacción con este contacto..."
                rows={3}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                disabled={submitting}
                required
                className="resize-none"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Label htmlFor="attachment" className="cursor-pointer">
                <div className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-2 rounded-md text-sm">
                  <PaperclipIcon className="h-4 w-4" />
                  {attachment ? "Cambiar archivo" : "Adjuntar archivo"}
                </div>
                <input
                  type="file"
                  id="attachment"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={submitting}
                />
              </Label>

              {attachment && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                  <FileText className="h-4 w-4" />
                  <span className="truncate max-w-xs">
                    {attachment.attachmentName}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => setAttachment(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              <div className="ml-auto">
                <Button
                  type="submit"
                  disabled={submitting || !newContent.trim()}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Registrar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>

          <Separator />

          {/* Historial de interacciones */}
          <div className="space-y-1 flex-1 min-h-0 flex flex-col">
            <div className="flex gap-2">
              <History size={17} className="items-center" />
              <h3 className="text-sm font-medium mb-6 items-center">
                Historial de interacciones
              </h3>
            </div>
            {loading ? (
              <div className="flex justify-center py-8 flex-1">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : interactions?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground flex-1">
                <p>No hay interacciones registradas con este contacto.</p>
                <p className="text-sm">
                  Registra la primera interacción arriba.
                </p>
              </div>
            ) : (
              <ScrollArea className="flex-1 min-h-[200px] max-h-[400px] pr-4 overflow-y-auto">
                <div className="space-y-4 w-full">
                  {interactions.map((interaction) => (
                    <div key={interaction.id} className="w-full">
                      <InteractionCard
                        interaction={interaction}
                        setInteractions={setInteractions}
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        {/* Diálogo para crear tarea */}
        <CreateTaskDialog
          open={openCreateTask}
          onOpenChange={setOpenCreateTask}
          onTaskCreated={() => {
            toast.success("Tarea creada exitosamente");
            setOpenCreateTask(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

// Componente para crear tareas desde el seguimiento
export const CreateTaskDialog = ({
  open,
  onOpenChange,
  onTaskCreated,
}: CreateTaskDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Función para manejar la selección de fecha
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDueDate(selectedDate);
    }
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
      const result = await createTaskFromContact(
        title,
        description,
        dueDate.toISOString()
      );

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      // Limpiar el formulario
      setTitle("");
      setDescription("");
      setDueDate(new Date());

      // Llamar la función de callback
      onTaskCreated?.();
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Error al crear la tarea");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
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
