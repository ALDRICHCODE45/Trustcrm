"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Clock, CheckCircle, Users, Calendar } from "lucide-react";
import { TaskStatus, User, Prisma } from "@prisma/client";
import {
  toggleTaskStatus,
  deleteTask,
  editTask,
  createTask,
} from "@/actions/tasks/actions";
import { toast } from "sonner";
import { TaskCard } from "./TaskCard";
import { AddTaskDialog } from "./AddTaskDialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ToastCustomMessage } from "@/components/ToastCustomMessage";

// Tipos
export type TaskWithUsers = Prisma.TaskGetPayload<{
  include: {
    assignedTo: true;
    notificationRecipients: true;
    linkedInteraction: {
      include: {
        contacto: true;
      };
    };
    vacancy: {
      include: {
        cliente: true;
        reclutador: true;
      };
    };
  };
}>;

interface EditData {
  title?: string;
  description?: string;
  dueDate?: Date;
}

interface Column {
  id: TaskStatus;
  title: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface Props {
  user: User;
  initialTasks: TaskWithUsers[];
  sharedTasks?: TaskWithUsers[]; // Tareas compartidas contigo
}

// Componente Sortable para las tareas
interface SortableTaskCardProps {
  task: TaskWithUsers;
  onToggleStatus: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEdit: (id: string, data: EditData) => void;
}

const SortableTaskCard = ({
  task,
  onToggleStatus,
  onDelete,
  onEdit,
}: SortableTaskCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${
        isDragging ? "rotate-2 shadow-xl opacity-95 scale-105" : ""
      } transition-all duration-200`}
    >
      <TaskCard
        activity={task}
        onToggleStatus={onToggleStatus}
        onDelete={onDelete}
        onEdit={onEdit}
      />
    </div>
  );
};

// Componente Droppable para las columnas
interface DroppableColumnProps {
  id: string;
  children: React.ReactNode;
  isDraggingOver?: boolean;
}

const DroppableColumn = ({
  id,
  children,
  isDraggingOver,
}: DroppableColumnProps) => {
  return (
    <div
      className={`transition-colors rounded-xl border ${
        isDraggingOver
          ? "bg-slate-50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600"
          : "bg-slate-50/50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-700"
      }`}
    >
      <ScrollArea className="h-[75vh] w-full rounded-xl">
        <div className="min-h-[60vh] p-4">{children}</div>
      </ScrollArea>
    </div>
  );
};

const columns: Column[] = [
  {
    id: "Pending",
    title: "Pendientes",
    icon: <Clock className="w-4 h-4" />,
    color: "text-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-900/10",
  },
  {
    id: "Done",
    title: "Completadas",
    icon: <CheckCircle className="w-4 h-4" />,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/10",
  },
];

// Componente simplificado para tareas compartidas
const SharedTaskCard = ({ task }: { task: TaskWithUsers }) => {
  const getDueDateStatus = () => {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (task.status === "Done") {
      return {
        color: "text-green-600",
        label: "Completada",
        bgColor: "bg-green-100 dark:bg-green-900/20",
        percentage: "100%",
      };
    }

    if (diffDays < 0)
      return {
        color: "text-red-600",
        label: "Vencida",
        bgColor: "bg-red-100 dark:bg-red-900/20",
        percentage: "90%",
      };
    if (diffDays === 0)
      return {
        color: "text-orange-600",
        label: "Hoy",
        bgColor: "bg-orange-100 dark:bg-orange-900/20",
        percentage: "75%",
      };
    if (diffDays === 1)
      return {
        color: "text-yellow-600",
        label: "Mañana",
        bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
        percentage: "50%",
      };
    return {
      color: "text-blue-600",
      label: `${diffDays} días`,
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      percentage: "25%",
    };
  };

  const dueDateStatus = getDueDateStatus();

  return (
    <Card className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200">
      <div className="space-y-4">
        {/* Header con título y progreso */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm leading-tight line-clamp-2">
            {task.title}
          </h4>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
            {task.description}
          </p>

          {/* Indicador de progreso */}
          <div className="flex items-center justify-between">
            <div
              className={`px-2 py-1 rounded-full text-xs font-medium ${dueDateStatus.bgColor} ${dueDateStatus.color}`}
            >
              {dueDateStatus.label}
            </div>
            <div className={`text-sm font-semibold ${dueDateStatus.color}`}>
              {dueDateStatus.percentage}
            </div>
          </div>
        </div>

        {/* Footer con creador y fecha */}
        <div className="flex items-center justify-between">
          {/* Fecha */}
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {format(new Date(task.dueDate), "d MMM", { locale: es })}
            </span>
          </div>

          {/* Creador */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Por: {task.assignedTo.name}
            </span>
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <Users className="w-3 h-3 text-blue-600" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export const TaskKanbanBoard = ({
  user,
  initialTasks,
  sharedTasks = [],
}: Props) => {
  const [tasks, setTasks] = useState<TaskWithUsers[]>(initialTasks);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  // Configurar sensores para @dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Actualizar tasks cuando cambie initialTasks
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  // Filtrar tareas por estado
  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  // Manejar inicio del drag
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  // Manejar drag and drop
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Encontrar la tarea que se está moviendo
    const activeTask = tasks.find((task) => task.id === activeId);
    if (!activeTask) {
      setActiveId(null);
      return;
    }

    // Determinar el estado de destino
    let newStatus: TaskStatus;
    if (overId === "Pending" || overId === "Done") {
      newStatus = overId as TaskStatus;
    } else {
      // Si se suelta sobre otra tarea, usar el estado de esa tarea
      const overTask = tasks.find((task) => task.id === overId);
      newStatus = overTask?.status || activeTask.status;
    }

    // Si no hay cambio de estado, solo reordenar
    if (activeTask.status === newStatus) {
      const tasksInColumn = tasks.filter((task) => task.status === newStatus);
      const activeIndex = tasksInColumn.findIndex(
        (task) => task.id === activeId
      );
      const overIndex = tasksInColumn.findIndex((task) => task.id === overId);

      if (activeIndex !== overIndex) {
        const reorderedTasks = arrayMove(tasksInColumn, activeIndex, overIndex);
        const otherTasks = tasks.filter((task) => task.status !== newStatus);
        setTasks([...otherTasks, ...reorderedTasks]);

        toast.custom((t) => (
          <ToastCustomMessage
            title="Orden actualizado"
            message="El orden de las tareas se ha actualizado correctamente"
            type="success"
            onClick={() => {
              toast.dismiss(t);
            }}
          />
        ));
      }
      setActiveId(null);
      return;
    }

    // Cambio de estado entre columnas
    const updatedTasks = tasks.map((task) =>
      task.id === activeId ? { ...task, status: newStatus } : task
    );
    setTasks(updatedTasks);

    try {
      await toggleTaskStatus(user.id, activeId);
      toast.custom((t) => (
        <ToastCustomMessage
          title="Estado actualizado"
          message="El estado de la tarea se ha actualizado correctamente"
          type="success"
          onClick={() => {
            toast.dismiss(t);
          }}
        />
      ));
    } catch (error) {
      // Revertir cambio si hay error
      setTasks(tasks);
      toast.custom((t) => (
        <ToastCustomMessage
          title="Error"
          message="Error al actualizar"
          type="error"
          onClick={() => {
            toast.dismiss(t);
          }}
        />
      ));
    }

    setActiveId(null);
  };

  // Función para cambiar el estado de una tarea
  const toggleActivityStatus = async (taskId: string) => {
    try {
      const promise = toggleTaskStatus(user.id, taskId);
      toast.promise(promise, {
        loading: "Actualizando...",
        success: "Estado actualizado",
        error: "Error al actualizar",
      });

      // Actualizar estado local optimistamente
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                status: task.status === "Pending" ? "Done" : "Pending",
              }
            : task
        )
      );
    } catch (error) {
      toast.custom((t) => (
        <ToastCustomMessage
          title="Error"
          message="Error al actualizar"
          type="error"
          onClick={() => {
            toast.dismiss(t);
          }}
        />
      ));
    }
  };

  // Función para eliminar una tarea
  const deleteActivity = async (taskId: string) => {
    try {
      const result = await deleteTask(user.id, taskId);
      if (!result.ok) {
        toast.custom((t) => (
          <ToastCustomMessage
            title="Error"
            message={result.message}
            type="error"
            onClick={() => {
              toast.dismiss(t);
            }}
          />
        ));
        return;
      }

      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      toast.custom((t) => (
        <ToastCustomMessage
          title="Tarea eliminada"
          message="La tarea se ha eliminado correctamente"
          type="success"
          onClick={() => {
            toast.dismiss(t);
          }}
        />
      ));
    } catch (error) {
      toast.custom((t) => (
        <ToastCustomMessage
          title="Error"
          message="Error al eliminar"
          type="error"
          onClick={() => {
            toast.dismiss(t);
          }}
        />
      ));
    }
  };

  // Función para editar una tarea
  const onEdit = async (id: string, data: EditData) => {
    const formData = new FormData();
    formData.append("title", data.title!);
    formData.append("description", data.description!);
    formData.append("dueDate", data.dueDate?.toISOString()!);
    formData.append("userId", user.id);

    try {
      await editTask(id, formData);
      toast.custom((t) => (
        <ToastCustomMessage
          title="Tarea editada"
          message="La tarea se ha editado correctamente"
          type="success"
          onClick={() => {
            toast.dismiss(t);
          }}
        />
      ));

      // Actualizar estado local optimistamente
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === id
            ? {
                ...task,
                title: data.title || task.title,
                description: data.description || task.description,
                dueDate: data.dueDate || task.dueDate,
              }
            : task
        )
      );
    } catch (error) {
      toast.custom((t) => (
        <ToastCustomMessage
          title="Error"
          message="Error al editar la tarea"
          type="error"
          onClick={() => {
            toast.dismiss(t);
          }}
        />
      ));
    }
  };

  // Función para agregar una nueva tarea
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

    try {
      const { ok, message } = await createTask(formData);
      if (!ok) {
        toast.custom((t) => (
          <ToastCustomMessage
            title="Error"
            message={message}
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
          title="Tarea creada"
          message="La tarea se ha creado correctamente"
          type="success"
          onClick={() => {
            toast.dismiss(t);
          }}
        />
      ));

      // Recargar para obtener las tareas ordenadas correctamente
      window.location.reload();
    } catch (error) {
      toast.custom((t) => (
        <ToastCustomMessage
          title="Error"
          message="Error al crear"
          type="error"
          onClick={() => {
            toast.dismiss(t);
          }}
        />
      ));
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header minimalista */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm px-3 py-1.5 font-medium">
            {tasks.length} tareas
          </Badge>
          <Badge
            variant="secondary"
            className="text-sm px-3 py-1.5 font-medium"
          >
            {getTasksByStatus("Pending").length} pendientes
          </Badge>
          <Badge variant="default" className="text-sm px-3 py-1.5 font-medium">
            {getTasksByStatus("Done").length} completadas
          </Badge>
        </div>

        <AddTaskDialog
          onAddActivity={addActivity}
          isOpen={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
        />
      </div>

      {/* Kanban Board con @dnd-kit */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToWindowEdges]}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columnas de tareas propias (con drag & drop) */}
          {columns.map((column) => {
            const columnTasks = getTasksByStatus(column.id);

            return (
              <div key={column.id} className="space-y-4">
                {/* Header de columna */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${column.bgColor}`}>
                      {column.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                        {column.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {columnTasks.length}{" "}
                        {columnTasks.length === 1 ? "tarea" : "tareas"}
                      </p>
                    </div>
                  </div>

                  {column.id === "Pending" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setIsAddDialogOpen(true)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Contenido de la columna */}
                <SortableContext
                  items={columnTasks.map((task) => task.id)}
                  strategy={verticalListSortingStrategy}
                  id={column.id}
                >
                  <DroppableColumn id={column.id}>
                    <div className="space-y-3">
                      {columnTasks.map((task) => (
                        <SortableTaskCard
                          key={task.id}
                          task={task}
                          onToggleStatus={toggleActivityStatus}
                          onDelete={deleteActivity}
                          onEdit={onEdit}
                        />
                      ))}
                    </div>

                    {columnTasks.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div
                          className={`p-4 rounded-lg ${column.bgColor} mb-3`}
                        >
                          {column.icon}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                          No hay tareas {column.title.toLowerCase()}
                        </p>
                        {column.id === "Pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-sm"
                            onClick={() => setIsAddDialogOpen(true)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Crear primera tarea
                          </Button>
                        )}
                      </div>
                    )}
                  </DroppableColumn>
                </SortableContext>
              </div>
            );
          })}

          {/* Tercera columna: Tareas compartidas (sin drag & drop) */}
          <div className="space-y-4">
            {/* Header de columna compartidas */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/10">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                    Compartidas
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {sharedTasks.length}{" "}
                    {sharedTasks.length === 1 ? "tarea" : "tareas"}
                  </p>
                </div>
              </div>
            </div>

            {/* Contenido de tareas compartidas */}
            <div className="border rounded-xl bg-slate-50/50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-700 transition-colors">
              <ScrollArea className="h-[75vh] w-full rounded-xl">
                <div className="min-h-[60vh] p-4">
                  <div className="space-y-3">
                    {sharedTasks.map((task) => (
                      <SharedTaskCard key={task.id} task={task} />
                    ))}
                  </div>

                  {sharedTasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 mb-3">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        No tienes tareas compartidas
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        {/* DragOverlay para mostrar el elemento que se está arrastrando */}
        <DragOverlay>
          {activeId ? (
            <div className="rotate-2 shadow-xl opacity-95 scale-105">
              <TaskCard
                activity={tasks.find((task) => task.id === activeId)!}
                onToggleStatus={() => {}}
                onDelete={() => {}}
                onEdit={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
