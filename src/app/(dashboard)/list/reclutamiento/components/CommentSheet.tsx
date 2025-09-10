"use client";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  Clock,
  MessageCircleMore,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  AlertCircle,
  BellRing,
  X,
  Filter,
  Calendar as CalendarLucide,
  CheckSquare,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect, useCallback, memo, useRef } from "react";
import { z } from "zod";
import { User } from "@prisma/client";
import { toast } from "sonner";
import { useComments } from "@/hooks/useComments";
import { CommentWithRelations, CreateCommentData } from "@/types/comment";
import { Label } from "@/components/ui/label";
import { ToastCustomMessage } from "@/components/ToastCustomMessage";

// Schema para validación del formulario
const comentarioFormSchema = z
  .object({
    texto: z
      .string()
      .min(1, {
        message: "El comentario no puede estar vacío.",
      })
      .max(1000, {
        message: "El comentario no puede exceder 1000 caracteres.",
      }),
    esTarea: z.boolean(),
    // Campos específicos para tareas
    tituloTarea: z.string().optional(),
    descripcionTarea: z.string().optional(),
    fechaEntrega: z.date().optional(),
    notificarAlCompletar: z.boolean().optional(),
    destinatariosNotificacion: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      // Si es una tarea, los campos específicos son obligatorios
      if (data.esTarea) {
        return (
          data.tituloTarea &&
          data.tituloTarea.trim().length > 0 &&
          data.descripcionTarea &&
          data.descripcionTarea.trim().length > 0 &&
          data.fechaEntrega
        );
      }
      return true;
    },
    {
      message:
        "Los campos título, descripción y fecha son obligatorios para las tareas.",
      path: ["tituloTarea"],
    }
  );

// Tipo derivado del schema
type ComentarioFormData = z.infer<typeof comentarioFormSchema>;

interface CommentFormProps {
  isEditing?: boolean;
  comentarioInicial?: CommentWithRelations | null;
  onSubmitSuccess?: () => void;
  vacancyId?: string; // ID de la vacante a la que pertenece el comentario
}

export const CommentSheet = ({
  vacancyId,
  vacancyOwnerId,
}: {
  vacancyId: string;
  vacancyOwnerId: string;
}) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isAddCommentDialogOpen, setIsAddCommentDialogOpen] = useState(false);

  // Usar useRef para mantener los IDs consistentes
  const vacancyIdRef = useRef<string>(vacancyId);
  const vacancyOwnerIdRef = useRef<string>(vacancyOwnerId);

  // Efecto para actualizar los IDs solo cuando el sheet está cerrado
  useEffect(() => {
    if (!sheetOpen) {
      vacancyIdRef.current = vacancyId;
      vacancyOwnerIdRef.current = vacancyOwnerId;
    }
  }, [vacancyId, vacancyOwnerId, sheetOpen]);

  const {
    comments,
    isLoading,
    error,
    addComment,
    deleteComment,
    editCommentById,
  } = useComments(vacancyIdRef.current);
  const [commentToDelete, setCommentToDelete] =
    useState<CommentWithRelations | null>(null);
  const [commentToEdit, setCommentToEdit] =
    useState<CommentWithRelations | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Estados para filtros
  const [filters, setFilters] = useState({
    dateRange: null as { from: Date; to: Date } | null,
    month: "all",
    type: "all" as "all" | "comments" | "tasks",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Meses del año para el filtro
  const meses = [
    { value: "0", label: "Enero" },
    { value: "1", label: "Febrero" },
    { value: "2", label: "Marzo" },
    { value: "3", label: "Abril" },
    { value: "4", label: "Mayo" },
    { value: "5", label: "Junio" },
    { value: "6", label: "Julio" },
    { value: "7", label: "Agosto" },
    { value: "8", label: "Septiembre" },
    { value: "9", label: "Octubre" },
    { value: "10", label: "Noviembre" },
    { value: "11", label: "Diciembre" },
  ];

  const handleDelete = useCallback((comment: CommentWithRelations) => {
    setCommentToDelete(comment);
    setIsDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!commentToDelete) return;

    try {
      await deleteComment(commentToDelete.id);
      toast.success("Comentario eliminado exitosamente");
      setIsDeleteDialogOpen(false);
      setCommentToDelete(null);
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Error al eliminar el comentario");
    }
  }, [commentToDelete, deleteComment]);

  const confirmEdit = useCallback(
    async (commentId: string, content: string) => {
      try {
        const response = await editCommentById(commentId, {
          content,
        });
        if (response.ok) {
          toast.success("Comentario editado exitosamente");
          setIsEditDialogOpen(false);
          setCommentToEdit(null);
          return;
        }
        toast.error("Error al editar el comentario");
      } catch (error) {
        console.error("Error editing comment:", error);
        toast.error("Error al editar el comentario");
      }
    },
    [editCommentById]
  );

  // Función para filtrar comentarios
  const filteredComments = comments.filter((comment) => {
    const commentDate = new Date(comment.createdAt);

    // Filtrar por tipo
    if (filters.type === "tasks" && !comment.taskId) return false;
    if (filters.type === "comments" && comment.taskId) return false;

    // Filtrar por rango de fechas
    if (filters.dateRange) {
      const isInRange =
        commentDate >= filters.dateRange.from &&
        commentDate <= filters.dateRange.to;
      if (!isInRange) return false;
    }

    // Filtrar por mes
    if (filters.month && filters.month !== "all") {
      const commentMonth = commentDate.getMonth().toString();
      if (commentMonth !== filters.month) return false;
    }

    return true;
  });

  const clearFilters = () => {
    setFilters({
      dateRange: null,
      month: "all",
      type: "all",
    });
  };

  const hasActiveFilters =
    filters.dateRange || filters.month !== "all" || filters.type !== "all";

  // Handler memoizado para evitar recreaciones
  const handleSheetOpenChange = useCallback((newOpen: boolean) => {
    setSheetOpen(newOpen);
  }, []);

  return (
    <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
      <SheetTrigger asChild>
        <div className="flex justify-center items-center">
          <Button variant="outline" className="" size="default">
            <MessageCircleMore />
          </Button>
        </div>
      </SheetTrigger>
      <SheetContent className="p-4">
        <SheetHeader className="mt-7">
          <>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold">Comentarios</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={showFilters ? "default" : "outline"}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="mr-1 h-4 w-4" />
                  Filtros
                </Button>
                <Dialog
                  open={isAddCommentDialogOpen}
                  onOpenChange={setIsAddCommentDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="mr-1 h-4 w-4" />
                      Agregar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto z-[200]">
                    <DialogHeader>
                      <DialogTitle>Nuevo Comentario</DialogTitle>
                      <Separator />
                    </DialogHeader>
                    <NuevoComentarioForm
                      vacancyId={vacancyIdRef.current}
                      vacancyOwnerId={vacancyOwnerIdRef.current}
                      onAddComment={addComment}
                      onSubmitSuccess={() => {
                        // El hook ya maneja la actualización automática
                        setIsAddCommentDialogOpen(false);
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Badge variant="secondary" className="text-xs">
                  {filteredComments.length} de {comments.length}
                </Badge>
              )}
            </div>
          </>
        </SheetHeader>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Filtros</h3>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs"
                >
                  Limpiar filtros
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3">
              {/* Filtro por tipo */}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2 block">
                  Tipo
                </label>
                <Select
                  value={filters.type}
                  onValueChange={(value: "all" | "comments" | "tasks") =>
                    setFilters({ ...filters, type: value })
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="comments">Solo comentarios</SelectItem>
                    <SelectItem value="tasks">Solo tareas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por mes */}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2 block">
                  Mes
                </label>
                <Select
                  value={filters.month}
                  onValueChange={(value) =>
                    setFilters({ ...filters, month: value })
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Seleccionar mes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los meses</SelectItem>
                    {meses.map((mes) => (
                      <SelectItem key={mes.value} value={mes.value}>
                        {mes.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por rango de fechas */}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2 block">
                  Rango de fechas
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-8 w-full pl-3 text-left font-normal text-xs",
                        !filters.dateRange && "text-muted-foreground"
                      )}
                    >
                      {filters.dateRange ? (
                        <>
                          {format(filters.dateRange.from, "dd/MM/yy", {
                            locale: es,
                          })}{" "}
                          -{" "}
                          {format(filters.dateRange.to, "dd/MM/yy", {
                            locale: es,
                          })}
                        </>
                      ) : (
                        <span>Seleccionar rango</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[8888]">
                    <Calendar
                      mode="range"
                      selected={filters.dateRange || undefined}
                      onSelect={(range) =>
                        setFilters({
                          ...filters,
                          dateRange: range
                            ? { from: range.from!, to: range.to || range.from! }
                            : null,
                        })
                      }
                      numberOfMonths={2}
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        )}

        {/* Lista de comentarios */}
        <div className="space-y-4 mt-6 h-[90%] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 mb-2" />
              <p className="text-gray-500 dark:text-gray-400">
                Cargando comentarios...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <AlertCircle className="h-12 w-12 text-red-300 dark:text-red-600 mb-2" />
              <p className="text-red-500 dark:text-red-400">
                Error al cargar comentarios
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {error}
              </p>
            </div>
          ) : filteredComments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <MessageCircleMore className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-gray-500 dark:text-gray-400">
                {hasActiveFilters
                  ? "No hay comentarios que coincidan con los filtros"
                  : "No hay comentarios"}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {hasActiveFilters
                  ? "Prueba ajustando los filtros"
                  : "Agrega un comentario usando el botón de arriba"}
              </p>
            </div>
          ) : (
            filteredComments.map((comentario, index) => (
              <Card
                key={comentario.id || index}
                className={cn(
                  "shadow-sm hover:shadow-md transition-all duration-200",
                  comentario.taskId
                    ? "border-l-4 border-l-blue-500 bg-blue-50/30 dark:bg-blue-900/10"
                    : "border-l-4 border-l-gray-300 dark:border-l-gray-600"
                )}
              >
                <CardHeader className="p-4 pb-3">
                  {/* Fila superior: Badge y menú */}
                  <div className="flex justify-between items-start mb-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "flex items-center gap-1.5 font-medium",
                        comentario.taskId
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700"
                          : "bg-gray-50 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600"
                      )}
                    >
                      {comentario.taskId ? (
                        <CheckSquare className="w-3 h-3" />
                      ) : (
                        <MessageCircleMore className="w-3 h-3" />
                      )}
                      {comentario.taskId ? "Tarea" : "Comentario"}
                    </Badge>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-gray-600"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={() => {
                            setCommentToEdit(comentario);
                            setIsEditDialogOpen(true);
                          }}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(comentario)}
                          className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Eliminar</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Fila inferior: Fecha y hora */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Clock size={12} />
                    <span>
                      {format(comentario.createdAt, "EEE dd/MM/yy", {
                        locale: es,
                      })}{" "}
                      • {format(comentario.createdAt, "HH:mm")}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="px-4 pb-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {comentario.content}
                  </p>
                </CardContent>

                <CardFooter className="px-4 py-3 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Por:
                      </span>
                      <span className="text-xs font-medium text-gray-700 max-w-[100px] truncate dark:text-gray-300">
                        {comentario.author.name}
                      </span>
                    </div>

                    {comentario.taskId && (
                      <div className="flex items-center gap-1">
                        <CalendarLucide size={12} className="text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Entrega:{" "}
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {format(comentario.task!.dueDate, "EEE dd/MM/yy", {
                              locale: es,
                            })}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </SheetContent>

      {/* Dialog para editar comentario */}
      {commentToEdit && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px] z-[99999]">
            <DialogHeader>
              <DialogTitle>Editar comentario</DialogTitle>
              <DialogDescription>
                Edita el contenido del comentario
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const content = formData.get("content") as string;
                await confirmEdit(commentToEdit.id, content);
              }}
            >
              <div className="grid gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="content">Contenido</Label>
                  <Input
                    id="content"
                    name="content"
                    defaultValue={commentToEdit.content}
                  />
                  <Input type="hidden" name="id" value={commentToEdit.id} />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Guardar cambios</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog para confirmar eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              Confirmar eliminación
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar este comentario? Esta acción no
            se puede deshacer.
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
};

export const NuevoComentarioForm = memo(
  ({
    isEditing = false,
    comentarioInicial = null,
    onSubmitSuccess = () => {},
    vacancyId,
    vacancyOwnerId,
    onAddComment,
  }: CommentFormProps & {
    onAddComment?: (commentData: CreateCommentData) => Promise<any>;
    vacancyOwnerId: string;
  }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);

    const form = useForm<ComentarioFormData>({
      resolver: zodResolver(comentarioFormSchema),
      defaultValues: {
        texto: comentarioInicial?.content || "",
        esTarea: comentarioInicial?.taskId ? true : false,
        tituloTarea: "",
        descripcionTarea: "",
        fechaEntrega: comentarioInicial?.createdAt
          ? new Date(comentarioInicial.createdAt)
          : undefined,
        notificarAlCompletar: false,
        destinatariosNotificacion: [],
      },
    });

    const esTarea = form.watch("esTarea");
    const notificarAlCompletar = form.watch("notificarAlCompletar");
    const destinatariosSeleccionados =
      form.watch("destinatariosNotificacion") || [];

    // Cargar usuarios cuando se abre el formulario y es una tarea
    useEffect(() => {
      const fetchUsers = async () => {
        if (!esTarea) return;

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

      if (esTarea) {
        fetchUsers();
      }
    }, [esTarea]);

    const removeUser = useCallback(
      (userIdToRemove: string) => {
        const currentUsers = form.getValues("destinatariosNotificacion") || [];
        form.setValue(
          "destinatariosNotificacion",
          currentUsers.filter((id) => id !== userIdToRemove)
        );
      },
      [form]
    );

    const onSubmit = async (data: ComentarioFormData) => {
      setIsLoading(true);
      setError(null);

      try {
        console.log(
          isEditing ? "Editando comentario:" : "Nuevo comentario:",
          data
        );

        // Preparar los datos para enviar al servidor
        const commentData: CreateCommentData = {
          content: data.texto,
          authorId: vacancyOwnerId,
          vacancyId: vacancyId,
          isTask: data.esTarea,
          title: data.tituloTarea,
          description: data.descripcionTarea,
          assignedToId: vacancyOwnerId,
          dueDate: data.fechaEntrega,
          notifyOnComplete: data.notificarAlCompletar || false,
          notificationRecipients: data.destinatariosNotificacion || [],
        };

        // Usar la función del hook si está disponible, sino usar la API directamente
        if (onAddComment) {
          await onAddComment(commentData);
        } else {
          const response = await fetch("/api/comments", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(commentData),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || "Error al crear el comentario");
          }

          if (!result.ok) {
            throw new Error(result.message || "Error al crear el comentario");
          }
        }

        toast.custom((t) => (
          <ToastCustomMessage
            title="Comentario creado exitosamente"
            message="El comentario ha sido creado exitosamente"
            type="success"
            onClick={() => toast.dismiss(t)}
          />
        ));

        onSubmitSuccess();

        // Limpiar formulario solo si es nuevo comentario
        if (!isEditing) {
          form.reset();
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Error al procesar el comentario";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Mostrar error si existe */}
          {error && (
            <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <p className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
              </div>
            </div>
          )}

          <FormField
            control={form.control}
            name="texto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comentario</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Escribe tu comentario aquí..."
                    className="resize-none min-h-24"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <div className="flex justify-between items-center">
                  <FormMessage />
                  <p className="text-xs text-gray-500">
                    {field.value.length}/1000 caracteres
                  </p>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="esTarea"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Marcar como tarea</FormLabel>
                  <FormDescription>
                    Las tareas requieren título, descripción y fecha límite
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      // Auto-llenar título y descripción con el contenido del comentario
                      if (checked) {
                        const comentarioTexto = form.getValues("texto");
                        if (comentarioTexto && comentarioTexto.trim()) {
                          // Solo auto-llenar si los campos están vacíos
                          if (!form.getValues("tituloTarea")) {
                            form.setValue(
                              "tituloTarea",
                              comentarioTexto.trim()
                            );
                          }
                          if (!form.getValues("descripcionTarea")) {
                            form.setValue(
                              "descripcionTarea",
                              comentarioTexto.trim()
                            );
                          }
                        }
                      }
                    }}
                    disabled={isLoading}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {esTarea && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span>Información de la tarea</span>
              </div>

              <FormField
                control={form.control}
                name="tituloTarea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Título de la tarea
                      <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Terminar proyecto de React"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="descripcionTarea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Descripción de la tarea
                      <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe los detalles de la tarea..."
                        className="resize-none min-h-20"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fechaEntrega"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>
                      Fecha límite
                      <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isLoading}
                        >
                          {field.value ? (
                            format(field.value, "d 'de' MMMM, yyyy", {
                              locale: es,
                            })
                          ) : (
                            <span>Selecciona una fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-[999999]">
                        <Calendar
                          mode="single"
                          captionLayout="dropdown"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notificarAlCompletar"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <BellRing className="h-4 w-4" />
                        <FormLabel>Notificar al completar</FormLabel>
                      </div>
                      <FormDescription>
                        Al activar esta opción los usuarios serán notificados
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {notificarAlCompletar && (
                <FormField
                  control={form.control}
                  name="destinatariosNotificacion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destinatarios de la notificación</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          const currentUsers = field.value || [];
                          if (!currentUsers.includes(value)) {
                            field.onChange([...currentUsers, value]);
                          }
                        }}
                        disabled={isLoading || isLoadingUsers}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isLoadingUsers
                                  ? "Cargando usuarios..."
                                  : "Seleccionar usuarios"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="z-[9999]">
                          {users.map((user) => (
                            <SelectItem
                              key={user.id}
                              value={user.id}
                              disabled={destinatariosSeleccionados.includes(
                                user.id
                              )}
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

                      {destinatariosSeleccionados.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {destinatariosSeleccionados.map((userId) => {
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
                                  disabled={isLoading}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => onSubmitSuccess()}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !form.formState.isValid}
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-white" />
                  Procesando...
                </>
              ) : isEditing ? (
                "Guardar cambios"
              ) : (
                "Guardar"
              )}
            </Button>
          </div>
        </form>
      </Form>
    );
  }
);

NuevoComentarioForm.displayName = "NuevoComentarioForm";
