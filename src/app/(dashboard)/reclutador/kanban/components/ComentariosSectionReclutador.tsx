"use client";
import { useComments } from "@/hooks/useComments";
import { VacancyWithRelations } from "../../components/ReclutadorColumns";
import { useState } from "react";
import { CommentWithRelations } from "@/types/comment";
import { toast } from "sonner";
import {
  AlertCircle,
  CheckSquare,
  CalendarIcon,
  Filter,
  MessageSquare,
  Plus,
  MoreVertical,
  Trash2,
  MessageSquareOff,
  Pencil,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Select } from "@/components/ui/select";
import { NuevoComentarioForm } from "@/app/(dashboard)/list/reclutamiento/components/CommentSheet";
import {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToastCustomMessage } from "@/components/ToastCustomMessage";
import { EditCommentDialog } from "./EditCommentDialog";

interface CommentsSectionProps {
  vacante: VacancyWithRelations;
}

export const CommentsSectionReclutador: React.FC<CommentsSectionProps> = ({
  vacante,
}) => {
  const {
    comments,
    isLoading,
    error,
    addComment,
    deleteComment,
    editCommentById,
  } = useComments(vacante.id);
  const [commentToDelete, setCommentToDelete] =
    useState<CommentWithRelations | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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

  const handleDelete = (comment: CommentWithRelations) => {
    setCommentToDelete(comment);
    setIsDeleteDialogOpen(true);
  };

  const confirmEdit = async (commentId: string, content: string) => {
    try {
      const response = await editCommentById(commentId, {
        content,
      });
      if (response.ok) {
        toast.custom((t) => (
          <ToastCustomMessage
            title="Comentario editado exitosamente"
            message="El comentario ha sido editado exitosamente"
            type="success"
            onClick={() => {
              toast.dismiss(t);
            }}
          />
        ));
        setIsEditDialogOpen(false);
        return;
      }
      toast.custom((t) => (
        <ToastCustomMessage
          title="Error al editar el comentario"
          message="Por favor, intenta nuevamente"
          type="error"
          onClick={() => {
            toast.dismiss(t);
          }}
        />
      ));
    } catch (error) {
      console.error("Error editing comment:", error);
      toast.custom((t) => (
        <ToastCustomMessage
          title="Error al editar el comentario"
          message="Por favor, intenta nuevamente"
          type="error"
          onClick={() => {
            toast.dismiss(t);
          }}
        />
      ));
    }
  };

  const confirmDelete = async () => {
    if (!commentToDelete) return;

    try {
      const result = await deleteComment(commentToDelete.id);
      if (!result.ok) {
        toast.custom((t) => (
          <ToastCustomMessage
            title="Error al eliminar el comentario"
            message={result.message || "Por favor, intenta nuevamente"}
            type="error"
            onClick={() => {
              toast.dismiss(t);
            }}
          />
        ));
        return;
      }
      toast.custom((t) => (
        <ToastCustomMessage
          title="Comentario eliminado exitosamente"
          message="El comentario ha sido eliminado exitosamente"
          type="success"
          onClick={() => {
            toast.dismiss(t);
          }}
        />
      ));
      setIsDeleteDialogOpen(false);
      setCommentToDelete(null);
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.custom((t) => (
        <ToastCustomMessage
          title="Error al eliminar el comentario"
          message="Por favor, intenta nuevamente"
          type="error"
          onClick={() => {
            toast.dismiss(t);
          }}
        />
      ));
    }
  };

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

  return (
    <div className="space-y-6 mt-4 h-[400px] overflow-hidden flex flex-col">
      {/* Encabezado con título y controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium uppercase text-muted-foreground flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" /> Historial de comentarios
          </h4>
          {hasActiveFilters && (
            <Badge variant="secondary" className="text-xs">
              {filteredComments.length} de {comments?.length || 0}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="h-7 px-2"
          >
            <Filter className="h-3 w-3" />
          </Button>
          <Dialog
            open={isCommentDialogOpen}
            onOpenChange={setIsCommentDialogOpen}
          >
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="h-7">
                <Plus className="h-3 w-3 mr-1" /> Añadir
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto z-[9999]">
              <DialogHeader>
                <DialogTitle>Nuevo Comentario</DialogTitle>
                <Separator />
              </DialogHeader>
              <NuevoComentarioForm
                vacancyId={vacante.id}
                vacancyOwnerId={vacante.reclutadorId}
                onAddComment={addComment}
                onSubmitSuccess={() => {
                  setIsCommentDialogOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Panel de filtros minimalista */}
      {showFilters && (
        <div className="p-3 bg-muted/30 rounded-lg border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Filtros</span>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs h-6 px-2"
              >
                Limpiar
              </Button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Filtro por tipo */}
            <Select
              value={filters.type}
              onValueChange={(value: "all" | "comments" | "tasks") =>
                setFilters({ ...filters, type: value })
              }
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[9999]">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="comments">Comentarios</SelectItem>
                <SelectItem value="tasks">Tareas</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro por mes */}
            <Select
              value={filters.month}
              onValueChange={(value) =>
                setFilters({ ...filters, month: value })
              }
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue placeholder="Mes" />
              </SelectTrigger>
              <SelectContent className="z-[9999]">
                <SelectItem value="all">Todos</SelectItem>
                {meses.map((mes) => (
                  <SelectItem key={mes.value} value={mes.value}>
                    {mes.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro por rango de fechas */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-7 px-2 text-xs justify-start text-left font-normal"
                >
                  {filters.dateRange ? (
                    <>
                      {format(filters.dateRange.from, "dd/MM", { locale: es })}{" "}
                      - {format(filters.dateRange.to, "dd/MM", { locale: es })}
                    </>
                  ) : (
                    "Rango"
                  )}
                  <CalendarIcon className="ml-auto h-3 w-3 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[9999]">
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
      )}

      {/* Lista de comentarios */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 mb-2" />
            <p className="text-sm text-muted-foreground">
              Cargando comentarios...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <AlertCircle className="h-8 w-8 text-red-400 mb-2" />
            <p className="text-sm text-red-500">Error al cargar comentarios</p>
          </div>
        ) : filteredComments.length > 0 ? (
          <div className="space-y-4">
            {/* Barra de tiempo para comentarios */}
            <div className="relative pb-2">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border"></div>

              {filteredComments.map((comentario, index) => (
                <div key={comentario.id} className="relative mb-6 last:mb-0">
                  {/* Indicador de tiempo */}
                  <div
                    className={`absolute left-4 top-0 -translate-x-1/2 w-2 h-2 rounded-full z-10 ${
                      comentario.taskId ? "bg-blue-500" : "bg-primary"
                    }`}
                  ></div>

                  <Card
                    className={cn(
                      `ml-8 ${index === 0 ? "border-primary" : ""}`,
                      comentario.taskId
                        ? "border-l-4 border-l-blue-500 bg-blue-50/30 dark:bg-blue-900/10"
                        : ""
                    )}
                  >
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
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
                              <MessageSquare className="w-3 h-3" />
                            )}
                            {comentario.taskId ? "Tarea" : "Comentario"}
                          </Badge>
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={comentario.author.image || ""}
                              alt={comentario.author.name}
                              className="w-full h-full object-cover"
                            />
                            <AvatarFallback className="text-xs">
                              {comentario.author.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <div className="text-xs font-medium leading-none">
                              {comentario.author.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {comentario.author.role || "Reclutador"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {format(comentario.createdAt, "dd/MM/yy", {
                              locale: es,
                            })}
                          </Badge>
                          {index === 0 && (
                            <Badge variant="secondary" className="text-xs">
                              Reciente
                            </Badge>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-gray-400 hover:text-gray-600"
                              >
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-40 z-[9999]"
                            >
                              <DropdownMenuItem
                                onClick={() => handleDelete(comentario)}
                                className="cursor-pointer"
                                variant="destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Eliminar</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setIsEditDialogOpen(true);
                                }}
                                className="cursor-pointer"
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                <span>Editar</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>
                    {isEditDialogOpen && (
                      <EditCommentDialog
                        open={isEditDialogOpen}
                        setOpen={setIsEditDialogOpen}
                        onConfirm={confirmEdit}
                        comment={comentario}
                      />
                    )}
                    <CardContent className="p-4 pt-2">
                      <p className="text-sm">{comentario.content}</p>
                      {/* Mostrar información adicional si es una tarea */}
                      {comentario.taskId && comentario.task && (
                        <div className="mt-3 p-2 bg-blue-50/50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                              Tarea: {comentario.task.title}
                            </span>
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3 text-blue-600" />
                              <span className="text-xs text-blue-600">
                                {format(comentario.task.dueDate, "dd/MM/yy", {
                                  locale: es,
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        ) : hasActiveFilters ? (
          <div className="flex flex-col items-center justify-center h-32 bg-muted/30 rounded-lg border border-dashed">
            <Filter className="h-8 w-8 mb-2 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">
              No hay comentarios que coincidan con los filtros
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={clearFilters}
            >
              Limpiar filtros
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 bg-muted/30 rounded-lg border border-dashed">
            <MessageSquareOff className="h-8 w-8 mb-2 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">
              No hay comentarios todavía
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => setIsCommentDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Añadir el primer comentario
            </Button>
          </div>
        )}
      </div>

      {/* Dialog para confirmar eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] z-[9999]">
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
    </div>
  );
};
