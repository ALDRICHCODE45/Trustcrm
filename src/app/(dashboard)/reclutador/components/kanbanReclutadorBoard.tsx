"use client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar as CalendarIcon,
  Clock,
  Building,
  AlertCircle,
  Loader2,
  Filter,
} from "lucide-react";
import { KanbanFilters, FilterState } from "./KanbanFilters";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { updateVacancyStatus } from "@/actions/vacantes/actions";
import { ValidationErrorToast } from "@/components/ui/ValidationErrorToast";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  KeyboardSensor,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { VacancyWithRelations } from "./ReclutadorColumns";
import { Role, VacancyEstado } from "@prisma/client";
import { User, Client } from "@prisma/client";
import { isToday, isPast, differenceInCalendarDays } from "date-fns";
import { DetailsSectionReclutador } from "../kanban/components/detailsSection";
import { CandidatesSectionReclutador } from "../kanban/components/CandidatosSection";
import { CommentsSectionReclutador } from "../kanban/components/ComentariosSectionReclutador";
import { DocumentsSectionReclutador } from "../kanban/components/DocumentSectionReclutador";
import { ToastCustomMessage } from "@/components/ToastCustomMessage";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PreplacementDialog } from "./PreplacementDialog";

// Types
interface ColumnProps {
  id: string;
  title: string;
  vacantes: VacancyWithRelations[];
  onVacanteClick: (vacante: VacancyWithRelations) => void;
  user_logged: {
    name: string;
    email: string;
    role: Role;
    image: string;
    id: string;
  };
}

interface VacanteCardProps {
  vacante: VacancyWithRelations;
  onClick: () => void;
  isDragging?: boolean;
}

// Utility Functions - Optimizadas con date-fns
// Estas funciones utilizan date-fns para manejo eficiente de fechas:
// - differenceInCalendarDays: para obtener días calendario reales
// - isToday, isPast: para verificaciones más precisas de fechas
// - Eliminamos el uso manual de startOfDay ya que differenceInCalendarDays lo maneja internamente

export const getTipoColor = (tipo: string) => {
  switch (tipo) {
    case "Nueva":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "Garantia":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
};

export const getEstadoColor = (estado: string) => {
  switch (estado) {
    case "QuickMeeting":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "Hunting":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
    case "Entrevistas":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "Placement":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "Perdida":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    case "Cancelada":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
};

// Función optimizada para calcular días transcurridos desde la asignación
export const calculateDaysFromAssignment = (fechaAsignacion: Date): number => {
  // Usar differenceInCalendarDays para días calendario reales
  const diffDays = differenceInCalendarDays(
    new Date(),
    new Date(fechaAsignacion)
  );
  return Math.max(0, diffDays); // Nunca menos de 0 días transcurridos
};

// Función optimizada para calcular días restantes hasta la entrega o días de retraso
export const calculateDaysToDelivery = (fechaEntrega: Date | null): number => {
  if (!fechaEntrega) return 0;

  // Usar differenceInCalendarDays para días calendario reales
  const diffDays = differenceInCalendarDays(new Date(fechaEntrega), new Date());
  return diffDays; // Positivo = días restantes, negativo = días de retraso
};

// Nueva función para obtener el color de progreso basado en los días restantes
export const getProgressColor = (daysRemaining: number): string => {
  if (daysRemaining < 0) {
    // Días de retraso - rojo intenso
    return "bg-red-600";
  } else if (daysRemaining <= 3) {
    // Crítico - rojo
    return "bg-red-500";
  } else if (daysRemaining <= 7) {
    // Urgente - naranja
    return "bg-orange-500";
  } else if (daysRemaining <= 14) {
    // Precaución - amarillo
    return "bg-yellow-500";
  } else {
    // Seguro - verde
    return "bg-green-500";
  }
};

// Función optimizada para obtener los días de diferencia entre la fecha de asignación y la fecha de entrega
export const getDaysDifference = (
  fechaAsignacion: Date,
  fechaEntrega: Date | null
): number => {
  if (!fechaEntrega) return 0;

  // Usar differenceInCalendarDays para días calendario reales
  const diferenciaDias = differenceInCalendarDays(
    new Date(fechaEntrega),
    new Date(fechaAsignacion)
  );
  return Math.max(0, diferenciaDias); // El total de días asignados para el proyecto
};

// Nueva función para obtener el porcentaje de progreso
export const getProgressPercentage = (
  fechaAsignacion: Date,
  fechaEntrega: Date | null
): number => {
  if (!fechaEntrega) return 0;

  const daysTranscurred = calculateDaysFromAssignment(fechaAsignacion);
  const totalDays = getDaysDifference(fechaAsignacion, fechaEntrega);

  if (totalDays === 0) return 0;

  const percentage = (daysTranscurred / totalDays) * 100;
  return Math.min(100, Math.max(0, percentage));
};

// Función optimizada para obtener el texto del estado del progreso usando date-fns
export const getProgressStatusText = (
  fechaEntrega: Date | null
): { text: string; color: string } => {
  if (!fechaEntrega) {
    return {
      text: "Sin fecha de entrega",
      color: "text-gray-500",
    };
  }

  const deliveryDate = new Date(fechaEntrega);
  const daysRemaining = calculateDaysToDelivery(fechaEntrega);

  // Usar isToday de date-fns para verificación más precisa
  if (isToday(deliveryDate)) {
    return {
      text: "Vence hoy",
      color: "text-red-600 font-semibold",
    };
  } else if (isPast(deliveryDate)) {
    const diasRetraso = Math.abs(daysRemaining);
    return {
      text: `${diasRetraso} día${diasRetraso === 1 ? "" : "s"} de retraso`,
      color: "text-red-600 font-semibold",
    };
  } else if (daysRemaining <= 3) {
    return {
      text: `${daysRemaining} día${daysRemaining === 1 ? "" : "s"} restante${
        daysRemaining === 1 ? "" : "s"
      }`,
      color: "text-red-600 font-semibold",
    };
  } else if (daysRemaining <= 7) {
    return {
      text: `${daysRemaining} días restantes`,
      color: "text-orange-600 font-medium",
    };
  } else {
    return {
      text: `${daysRemaining} días restantes`,
      color: "text-green-600",
    };
  }
};

// Función auxiliar optimizada que combina múltiples cálculos de fecha
export const getDeliveryStatus = (
  fechaAsignacion: Date,
  fechaEntrega: Date | null
) => {
  if (!fechaEntrega) {
    return {
      daysTranscurred: calculateDaysFromAssignment(fechaAsignacion),
      daysRemaining: 0,
      totalDays: 0,
      progressPercentage: 0,
      progressColor: "bg-gray-400",
      statusText: { text: "Sin fecha de entrega", color: "text-gray-500" },
      isOverdue: false,
      isDueToday: false,
    };
  }

  const daysTranscurred = calculateDaysFromAssignment(fechaAsignacion);
  const daysRemaining = calculateDaysToDelivery(fechaEntrega);
  const totalDays = getDaysDifference(fechaAsignacion, fechaEntrega);
  const progressPercentage = getProgressPercentage(
    fechaAsignacion,
    fechaEntrega
  );
  const progressColor = getProgressColor(daysRemaining);
  const statusText = getProgressStatusText(fechaEntrega);
  const deliveryDate = new Date(fechaEntrega);

  return {
    daysTranscurred,
    daysRemaining,
    totalDays,
    progressPercentage,
    progressColor,
    statusText,
    isOverdue: isPast(deliveryDate) && !isToday(deliveryDate),
    isDueToday: isToday(deliveryDate),
  };
};

// Draggable Vacante Card Component
const DraggableVacanteCard: React.FC<VacanteCardProps> = ({
  vacante,
  onClick,
  isDragging = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: vacante.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
    zIndex: isDragging || isSortableDragging ? 1000 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group"
    >
      <Card
        className={`cursor-grab active:cursor-grabbing hover:shadow-lg transition-all duration-200 rounded-2xl border-2 ${
          isDragging || isSortableDragging
            ? "border-blue-400 shadow-xl scale-105"
            : "border-slate-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
        } bg-white dark:bg-gray-800 relative`}
        onClick={onClick}
      >
        {/* Indicador visual cuando se arrastra sobre esta tarjeta */}
        <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-blue-400 bg-blue-50/20 dark:bg-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

        <CardHeader className="p-4 pb-2">
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger>
                      <h3 className="font-semibold text-base truncate max-w-[100px]">
                        {vacante.posicion}
                      </h3>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span className="text-sm break-words">
                        {vacante.posicion}
                      </span>
                    </TooltipContent>
                  </Tooltip>
                </div>
                {/* Indicador de retraso - debajo del nombre */}
                {(() => {
                  const daysRemaining = calculateDaysToDelivery(
                    vacante.fechaEntrega
                  );
                  if (daysRemaining < 0) {
                    return (
                      <div className="flex items-center mt-1">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="text-xs text-red-600 font-semibold ml-1">
                          ¡Retraso!
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <Building className="h-4 w-4 mr-1" />
                  <span className="truncate max-w-[100px]">
                    {vacante.cliente?.cuenta || "Sin cliente"}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge
                  variant="outline"
                  className={
                    getTipoColor(vacante.tipo) + " ml-2 whitespace-nowrap"
                  }
                >
                  {vacante.tipo}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 pt-0 pb-2">
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={vacante.reclutador?.image || ""}
                  alt={vacante.reclutador?.name || "Reclutador"}
                  className="h-full w-full object-cover"
                />
                <AvatarFallback>
                  {vacante.reclutador?.name?.charAt(0) || "R"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">
                {vacante.reclutador.name.length > 10
                  ? `${vacante.reclutador.name.slice(0, 10)}...`
                  : vacante.reclutador.name}
              </span>
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <CalendarIcon className="h-4 w-4 mr-1" />
              <span>
                {vacante.fechaEntrega?.toLocaleDateString() || "Sin fecha"}
              </span>
            </div>
          </div>

          {/* Barra de progreso visual */}
          {(() => {
            const valueToUse = vacante.tiempoTranscurrido
              ? vacante.tiempoTranscurrido
              : calculateDaysFromAssignment(vacante.fechaAsignacion);

            const daysTranscurred = valueToUse;
            const daysRemaining = calculateDaysToDelivery(vacante.fechaEntrega);
            const progressPercentage = getProgressPercentage(
              vacante.fechaAsignacion,
              vacante.fechaEntrega
            );
            const progressColor = getProgressColor(daysRemaining);

            return (
              <div className="mt-3">
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${progressColor} transition-all duration-300`}
                    style={{
                      width: `${progressPercentage}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{daysTranscurred}d transcurridos</span>
                  {daysRemaining < 0 ? (
                    <span className="text-red-600 font-semibold">
                      {Math.abs(daysRemaining)}d retraso
                    </span>
                  ) : (
                    <span>{daysRemaining}d restantes</span>
                  )}
                </div>
              </div>
            );
          })()}
        </CardContent>
        <CardFooter className="px-4 pt-2 pb-4 flex items-center justify-between border-t border-slate-100 dark:border-gray-700">
          <Badge variant="outline" className={getEstadoColor(vacante.estado)}>
            {vacante.estado}
          </Badge>
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            <span>
              {calculateDaysFromAssignment(vacante.fechaAsignacion)} días
            </span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

// Kanban Column Component
const DroppableColumn: React.FC<ColumnProps> = ({
  id,
  title,
  vacantes,
  onVacanteClick,
  user_logged,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`w-[320px] flex-shrink-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-3 h-full flex flex-col border-2 transition-all duration-200 ${
        isOver
          ? "border-blue-400 bg-blue-50/50 dark:bg-blue-900/20"
          : "border-slate-200 dark:border-gray-700"
      } shadow-lg`}
    >
      <div className="p-4 bg-white dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm mb-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm text-normal  text-gray-800 dark:text-black">
            {title}
          </h2>
          <span className="text-sm font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
            {vacantes.length}
          </span>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-3 px-2">
          <SortableContext
            items={vacantes.map((v) => v.id.toString())}
            strategy={verticalListSortingStrategy}
          >
            {vacantes.map((vacante) => (
              <Dialog key={vacante.id}>
                <DialogTrigger asChild>
                  <div>
                    <DraggableVacanteCard
                      vacante={vacante}
                      onClick={() => onVacanteClick(vacante)}
                    />
                  </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[730px] max-h-[90vh] overflow-y-auto z-[900]">
                  <DialogHeader>
                    <DialogTitle className="text-xl">
                      {vacante.posicion}
                    </DialogTitle>
                  </DialogHeader>
                  <VacanteTabs vacante={vacante} user_logged={user_logged} />
                </DialogContent>
              </Dialog>
            ))}
          </SortableContext>
          {/* Área de drop vacía al final de la columna */}
          {vacantes.length === 0 && (
            <div className="h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Arrastra vacantes aquí
              </span>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export const VacanteTabs: React.FC<{
  vacante: VacancyWithRelations;
  user_logged: {
    name: string;
    email: string;
    role: Role;
    image: string;
    id: string;
  };
}> = ({ vacante, user_logged }) => (
  <Tabs defaultValue="detalles">
    <TabsList className="grid w-full grid-cols-4">
      <TabsTrigger value="detalles">Detalles</TabsTrigger>
      <TabsTrigger value="candidatos">Candidatos</TabsTrigger>
      <TabsTrigger value="comentarios">Comentarios</TabsTrigger>
      <TabsTrigger value="documentos">Documentos</TabsTrigger>
    </TabsList>
    <TabsContent value="detalles">
      <DetailsSectionReclutador
        vacanteId={vacante.id}
        user_logged={user_logged}
      />
    </TabsContent>
    <TabsContent value="candidatos">
      <CandidatesSectionReclutador
        vacancyId={vacante.id}
        user_logged={user_logged}
      />
    </TabsContent>
    <TabsContent value="comentarios">
      <CommentsSectionReclutador vacante={vacante} />
    </TabsContent>
    <TabsContent value="documentos">
      <DocumentsSectionReclutador vacante={vacante} />
    </TabsContent>
  </Tabs>
);

interface KanbanBoardPageProps {
  initialVacantes: VacancyWithRelations[];
  user_logged: {
    name: string;
    email: string;
    role: Role;
    image: string;
    id: string;
  };
  reclutadores: User[];
  clientes: Client[];
  refreshVacancies: () => void;
}

export const KanbanBoardPage = ({
  initialVacantes,
  user_logged,
  reclutadores,
  clientes,
  refreshVacancies,
}: KanbanBoardPageProps) => {
  //Dialogo para pedir el salario final y la fecha de proxima entrada
  const [showPreplacementDialog, setShowPreplacementDialog] = useState(false);
  const [preplacementVacanteId, setPreplacementVacanteId] = useState<
    string | null
  >(null);

  const [allVacantes, setAllVacantes] =
    useState<VacancyWithRelations[]>(initialVacantes);
  const [filteredVacantes, setFilteredVacantes] =
    useState<VacancyWithRelations[]>(initialVacantes);
  const [selectedVacante, setSelectedVacante] =
    useState<VacancyWithRelations | null>(null);
  const [mobileView, setMobileView] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isFilteringVacantes, setIsFilteringVacantes] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    reclutadorId: null,
    clienteId: null,
    tipo: null,
    fechaAsignacion: { from: null, to: null },
    año: null,
    mes: null,
    rangoMeses: { from: null, to: null },
  });

  // Meses del año para referencia
  const months = [
    { value: 1, label: "Enero" },
    { value: 2, label: "Febrero" },
    { value: 3, label: "Marzo" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Mayo" },
    { value: 6, label: "Junio" },
    { value: 7, label: "Julio" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Septiembre" },
    { value: 10, label: "Octubre" },
    { value: 11, label: "Noviembre" },
    { value: 12, label: "Diciembre" },
  ];

  // Configurar sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Función para aplicar filtros con debouncing
  const applyFilters = (
    vacantes: VacancyWithRelations[],
    filterState: FilterState
  ) => {
    let filtered = [...vacantes];

    // Filtro por término de búsqueda (posición)
    if (filterState.searchTerm) {
      filtered = filtered.filter((v) =>
        v.posicion.toLowerCase().includes(filterState.searchTerm.toLowerCase())
      );
    }

    // Filtro por reclutador
    if (filterState.reclutadorId) {
      filtered = filtered.filter(
        (v) => v.reclutadorId === filterState.reclutadorId
      );
    }

    // Filtro por cliente
    if (filterState.clienteId) {
      filtered = filtered.filter((v) => v.clienteId === filterState.clienteId);
    }

    // Filtro por tipo
    if (filterState.tipo) {
      filtered = filtered.filter((v) => v.tipo === filterState.tipo);
    }

    // Filtro por rango de fechas de asignación
    if (filterState.fechaAsignacion.from || filterState.fechaAsignacion.to) {
      filtered = filtered.filter((v) => {
        const fechaAsignacion = new Date(v.fechaAsignacion);
        const from = filterState.fechaAsignacion.from;
        const to = filterState.fechaAsignacion.to;

        if (from && to) {
          return fechaAsignacion >= from && fechaAsignacion <= to;
        } else if (from) {
          return fechaAsignacion >= from;
        } else if (to) {
          return fechaAsignacion <= to;
        }
        return true;
      });
    }

    // Filtro por año
    if (filterState.año) {
      filtered = filtered.filter((v) => {
        const year = new Date(v.fechaAsignacion).getFullYear();
        return year === filterState.año;
      });
    }

    // Filtro por mes
    if (filterState.mes) {
      filtered = filtered.filter((v) => {
        const month = new Date(v.fechaAsignacion).getMonth() + 1;
        return month === filterState.mes;
      });
    }

    // Filtro por rango de meses
    if (filterState.rangoMeses.from || filterState.rangoMeses.to) {
      filtered = filtered.filter((v) => {
        const month = new Date(v.fechaAsignacion).getMonth() + 1;
        const from = filterState.rangoMeses.from;
        const to = filterState.rangoMeses.to;

        if (from && to) {
          return month >= from && month <= to;
        } else if (from) {
          return month >= from;
        } else if (to) {
          return month <= to;
        }
        return true;
      });
    }

    return filtered;
  };

  // Manejar cambios en los filtros con loading state
  const handleFilterChange = async (newFilters: FilterState) => {
    setIsFilteringVacantes(true);
    setFilters(newFilters);

    // Simular un pequeño delay para mejor UX
    await new Promise((resolve) => setTimeout(resolve, 100));

    const filtered = applyFilters(allVacantes, newFilters);
    setFilteredVacantes(filtered);
    setIsFilteringVacantes(false);
  };

  // Usar filtered vacantes en lugar de las originales
  const validVacantes = filteredVacantes.filter((vacante) => {
    if (!vacante.reclutador) {
      console.warn(`Vacante ${vacante.id} no tiene reclutador asignado`);
      return false;
    }
    return true;
  });

  // Función para actualizar vacantes después de cambios
  const updateVacantes = (updatedVacantes: VacancyWithRelations[]) => {
    setAllVacantes(updatedVacantes);
    const filtered = applyFilters(updatedVacantes, filters);
    setFilteredVacantes(filtered);
  };

  const columns = [
    { id: "QuickMeeting", title: "Quick Meeting" },
    { id: "Hunting", title: "Hunting" },
    { id: "Entrevistas", title: "Entrevistas Con Cliente" },
    { id: "PrePlacement", title: "Pre Placement" },
    { id: "Placement", title: "Placement" },
    { id: "StandBy", title: "Stand By" },
    { id: "Perdida", title: "Posición perdida" },
    { id: "Cancelada", title: "Cancelada" },
  ];

  // Función para manejar el inicio del drag
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Función para manejar el final del drag
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Encontrar la vacante activa
    const activeVacante = validVacantes.find(
      (v) => v.id.toString() === activeId
    );
    if (!activeVacante) return;

    // Buscar la tarjeta objetivo
    const overVacante = validVacantes.find((v) => v.id.toString() === overId);

    // Verificar si se está moviendo a una nueva columna
    const targetColumn = columns.find((col) => col.id === overId);

    // Si se arrastra directamente sobre una columna
    if (targetColumn && activeVacante.estado !== targetColumn.id) {
      // Movimiento entre columnas
      try {
        setIsUpdating(true);

        //validar si el nuevo status es Preplacement
        //Para pedir el salario final y la fecha de proxima entrada
        if (
          (targetColumn.id === VacancyEstado.PrePlacement ||
            targetColumn.id === VacancyEstado.Placement) &&
          !activeVacante.salarioFinal &&
          !activeVacante.fecha_proxima_entrada
        ) {
          //abrir dialogo para pedir el salario final y la fecha de proxima entrada
          setPreplacementVacanteId(activeVacante.id);
          setShowPreplacementDialog(true);
          return;
        }

        // Actualizar el estado en el backend
        const result = await updateVacancyStatus(
          activeId,
          targetColumn.id as any
        );

        if (result.ok) {
          // Actualizar el estado local
          const updatedVacantes = allVacantes.map((v: VacancyWithRelations) =>
            v.id.toString() === activeId
              ? { ...v, estado: targetColumn.id as any }
              : v
          );
          updateVacantes(updatedVacantes);

          toast.custom((t) => (
            <ToastCustomMessage
              title="Vacante actualizada"
              message={`Vacante actualizada a ${targetColumn.title}`}
              type="success"
              onClick={() => {
                toast.dismiss(t);
              }}
            />
          ));
        } else {
          // Verificar si es un error de validación con razón detallada
          if (result.reason) {
            toast.custom((t) => (
              <ValidationErrorToast
                title="No se puede cambiar el estado"
                message={result.message || "Error al actualizar la vacante"}
                reason={result.reason}
                onClick={() => {
                  toast.dismiss(t);
                }}
              />
            ));
          } else {
            toast.custom((t) => (
              <ToastCustomMessage
                title="Error"
                message={result.message || "Error al actualizar la vacante"}
                type="error"
                onClick={() => {
                  toast.dismiss(t);
                }}
              />
            ));
          }
        }
      } catch (error) {
        console.error("Error updating vacancy status:", error);
        toast.custom((t) => (
          <ToastCustomMessage
            title="Error"
            message="Error al actualizar el estado de la vacante"
            type="error"
            onClick={() => {
              toast.dismiss(t);
            }}
          />
        ));
      } finally {
        setIsUpdating(false);
      }
    } else if (overVacante) {
      // Se arrastra sobre otra tarjeta
      if (activeVacante.estado !== overVacante.estado) {
        // Movimiento entre columnas a través de una tarjeta
        try {
          setIsUpdating(true);

          const result = await updateVacancyStatus(
            activeId,
            overVacante.estado as any
          );

          if (result.ok) {
            const updatedVacantes = allVacantes.map((v: VacancyWithRelations) =>
              v.id.toString() === activeId
                ? { ...v, estado: overVacante.estado as any }
                : v
            );
            updateVacantes(updatedVacantes);

            const targetColumnTitle =
              columns.find((col) => col.id === overVacante.estado)?.title ||
              overVacante.estado;

            toast.custom((t) => (
              <ToastCustomMessage
                title="Vacante actualizada"
                message={`Vacante actualizada a ${targetColumnTitle}`}
                type="success"
                onClick={() => {
                  toast.dismiss(t);
                }}
              />
            ));
          } else {
            // Verificar si es un error de validación con razón detallada
            if (result.reason) {
              toast.custom((t) => (
                <ValidationErrorToast
                  title="No se puede cambiar el estado"
                  message={result.message || "Error al actualizar la vacante"}
                  reason={result.reason}
                  onClick={() => {
                    toast.dismiss(t);
                  }}
                />
              ));
            } else {
              toast.custom((t) => (
                <ToastCustomMessage
                  title="Error"
                  message={result.message || "Error al actualizar la vacante"}
                  type="error"
                  onClick={() => {
                    toast.dismiss(t);
                  }}
                />
              ));
            }
          }
        } catch (error) {
          console.error("Error updating vacancy status:", error);
          toast.custom((t) => (
            <ToastCustomMessage
              title="Error"
              message="Error al actualizar el estado de la vacante"
              type="error"
              onClick={() => {
                toast.dismiss(t);
              }}
            />
          ));
        } finally {
          setIsUpdating(false);
        }
      } else {
        // Reordenamiento dentro de la misma columna
        const activeVacanteIndex = validVacantes.findIndex(
          (v) => v.id.toString() === activeId
        );
        const overVacanteIndex = validVacantes.findIndex(
          (v) => v.id.toString() === overId
        );

        if (activeVacanteIndex !== overVacanteIndex) {
          const newVacantes = arrayMove(
            validVacantes,
            activeVacanteIndex,
            overVacanteIndex
          );
          updateVacantes(newVacantes);
        }
      }
    } else if (targetColumn && activeVacante.estado === targetColumn.id) {
      // Arrastrar sobre una columna vacía en la misma columna
      // No hacer nada ya que está en la misma columna
    }
  };

  // Función para manejar el drag over (para mejor UX)
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Encontrar la vacante activa
    const activeVacante = validVacantes.find(
      (v) => v.id.toString() === activeId
    );
    if (!activeVacante) return;

    // Buscar la tarjeta objetivo
    const overVacante = validVacantes.find((v) => v.id.toString() === overId);

    // Verificar si se está moviendo a una nueva columna
    const targetColumn = columns.find((col) => col.id === overId);

    if (targetColumn && activeVacante.estado !== targetColumn.id) {
      // Arrastrar sobre una columna diferente
      // La columna se resaltará automáticamente gracias al isOver del useDroppable
    } else if (overVacante && activeVacante.estado !== overVacante.estado) {
      // Arrastrar sobre una tarjeta en una columna diferente
      // Esto permitirá el movimiento entre columnas
    } else if (overVacante && activeVacante.estado === overVacante.estado) {
      // Arrastrar sobre una tarjeta en la misma columna
      // Esto permitirá el reordenamiento
    }
  };

  // Obtener la vacante activa para el overlay
  const activeVacante = activeId
    ? validVacantes.find((v) => v.id.toString() === activeId)
    : null;

  const isAnyFilterApplied =
    filters.searchTerm ||
    filters.reclutadorId ||
    filters.clienteId ||
    filters.tipo ||
    filters.fechaAsignacion.from ||
    filters.fechaAsignacion.to ||
    filters.año ||
    filters.mes ||
    filters.rangoMeses.from ||
    filters.rangoMeses.to;

  return (
    <>
      <KanbanFilters
        reclutadores={reclutadores}
        clientes={clientes}
        vacantes={allVacantes}
        onFilterChange={handleFilterChange}
      />
      <div className="flex flex-col h-[calc(100vh-200px)]">
        {/* Filter status indicator */}
        {isAnyFilterApplied && (
          <div className="px-6 py-3 flex flex-wrap gap-2 text-sm items-center border-b bg-muted/30">
            <span className="text-muted-foreground">
              Mostrando {validVacantes.length} de {allVacantes.length} vacantes
            </span>
          </div>
        )}

        {/* Loading indicator for filtering */}
        {isFilteringVacantes && (
          <div className="px-6 py-2 flex items-center justify-center bg-muted/20 border-b">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Aplicando filtros...</span>
            </div>
          </div>
        )}

        {isUpdating && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center space-x-3">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-gray-700 dark:text-gray-300">
                Actualizando vacante...
              </span>
            </div>
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToWindowEdges]}
        >
          <ScrollArea className="flex-1 pt-4">
            <div className="flex gap-14 h-full">
              {validVacantes.length === 0 ? (
                <div className="flex-1 flex items-center justify-center h-full  hhh-[calc(100vh-300px)]">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                      <Filter className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      No se encontraron vacantes
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      No hay vacantes que coincidan con los filtros aplicados.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() =>
                        handleFilterChange({
                          searchTerm: "",
                          reclutadorId: null,
                          clienteId: null,
                          tipo: null,
                          fechaAsignacion: { from: null, to: null },
                          año: null,
                          mes: null,
                          rangoMeses: { from: null, to: null },
                        })
                      }
                    >
                      Limpiar filtros
                    </Button>
                  </div>
                </div>
              ) : (
                columns.map(
                  (column) =>
                    (mobileView === null || mobileView === column.id) && (
                      <div
                        className="h-[calc(100vh-330px)] flex flex-col"
                        key={column.id}
                      >
                        <DroppableColumn
                          user_logged={user_logged}
                          key={column.id}
                          id={column.id}
                          title={column.title}
                          vacantes={validVacantes.filter(
                            (v) => v.estado === column.id
                          )}
                          onVacanteClick={setSelectedVacante}
                        />
                      </div>
                    )
                )
              )}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeVacante ? (
              <DraggableVacanteCard
                vacante={activeVacante}
                onClick={() => {}}
                isDragging={true}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
      {preplacementVacanteId && (
        <PreplacementDialog
          open={showPreplacementDialog}
          setOpen={setShowPreplacementDialog}
          activeVacanteId={preplacementVacanteId}
          refreshVacancies={refreshVacancies}
        />
      )}
    </>
  );
};
