"use client";
import Confetti from "react-confetti";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensors,
  useSensor,
  closestCorners,
} from "@dnd-kit/core";
import { Card } from "@/components/ui/card";
import { TagIcon, X } from "lucide-react";
import { toast } from "sonner";
import { KanbanFilters, FilterState } from "./components/KanbanFilters";
import { DroppableKanbanColumn } from "./components/KanbanColumn";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Lead, LeadStatus, SubSector, User } from "@prisma/client";
import {
  editLeadById,
  editLeadByIdAndCreatePreClient,
} from "@/actions/leads/actions";
import { useWindowSize } from "@/components/providers/ConfettiProvider";
import { format, isSameDay } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  ContactoCalidoDialog,
  ContactoCalidoFormData,
} from "./components/ContactoCalidoDialog";
import { getAllSubSectores } from "@/actions/subsectores/actions";
import {
  useInfiniteLeads,
  LeadWithRelations,
  FilterState as InfiniteFilterState,
} from "@/hooks/use-infinite-leads";

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
}

interface Props {
  initialLeadsData: Record<LeadStatus, LeadWithRelations[]>;
  initialPaginationInfo: Record<LeadStatus, PaginationInfo>;
  generadores: User[];
}

const getSubSectores = async () => {
  const subSectores = await getAllSubSectores();
  return subSectores;
};

export default function KanbanLeadsBoard({
  initialLeadsData,
  initialPaginationInfo,
  generadores,
}: Props) {
  const { width, height } = useWindowSize();

  // Usar el hook de infinite leads
  const {
    leadsData,
    paginationInfo,
    loadingStates,
    loadMoreLeads,
    refreshLeads,
    updateLeadInState,
  } = useInfiniteLeads(initialLeadsData, initialPaginationInfo);

  const [showConfetti, setShowConfetti] = useState(false);
  const [, setSelectedTask] = useState<Lead | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeLead, setActiveLead] = useState<LeadWithRelations | null>(null);
  const [subSectores, setSubSectores] = useState<SubSector[]>([]);

  // Estados para el dialog de ContactoCalido
  const [showContactoCalidoDialog, setShowContactoCalidoDialog] =
    useState(false);
  const [pendingLeadUpdate, setPendingLeadUpdate] = useState<{
    leadId: string;
    newStatus: LeadStatus;
    leadToUpdate: LeadWithRelations;
  } | null>(null);

  const [filters, setFilters] = useState<InfiniteFilterState>({
    generadorId: null,
    fechaCreacion: { from: null, to: null },
    oficina: null,
    searchTerm: "",
  });

  // Memoizar sensors para evitar recreación - FIXED: no usar useMemo con hooks
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 10 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    })
  );

  // Memoizar fetch de subsectores
  const fetchSubSectores = useCallback(async () => {
    try {
      const subSectores = await getSubSectores();
      setSubSectores(subSectores);
    } catch (error) {
      console.error("Error fetching subsectores:", error);
    }
  }, []);

  useEffect(() => {
    fetchSubSectores();
  }, [fetchSubSectores]);

  // Memoizar refreshLeads para evitar bucle infinito
  const memoizedRefreshLeads = useCallback(
    (newFilters: InfiniteFilterState) => {
      refreshLeads(newFilters);
    },
    [refreshLeads]
  );

  // Cuando cambien los filtros, recargar datos - FIXED: usar memoizedRefreshLeads
  useEffect(() => {
    memoizedRefreshLeads(filters);
  }, [filters, memoizedRefreshLeads]);

  const handleFilterChange = useCallback((newFilters: InfiniteFilterState) => {
    setFilters(newFilters);
  }, []);

  const clearSingleFilter = useCallback(
    (filterKey: keyof InfiniteFilterState) => {
      setFilters((prev) => ({
        ...prev,
        [filterKey]:
          filterKey === "fechaCreacion" ? { from: null, to: null } : null,
      }));
    },
    []
  );

  // Funciones para manejar el dialog de ContactoCalido
  const handleContactoCalidoConfirm = useCallback(
    async (formData: ContactoCalidoFormData) => {
      if (pendingLeadUpdate) {
        // Crear FormData con TODOS los datos incluyendo el nuevo status
        const formDataToSend = new FormData();
        formDataToSend.append("numero_empleados", formData.numeroEmpleados);
        formDataToSend.append("ubicacion", formData.ubicacion);
        formDataToSend.append("subSectorId", formData.subsector);
        formDataToSend.append("status", pendingLeadUpdate.newStatus);

        // Buscar el subsector seleccionado para incluir el objeto completo
        const selectedSubSector = subSectores.find(
          (sub) => sub.id === formData.subsector
        );

        // Actualizar el estado local optimistamente con todos los cambios
        updateLeadInState(pendingLeadUpdate.leadId, {
          status: pendingLeadUpdate.newStatus,
          numero_empleados:
            formData.numeroEmpleados === "500+"
              ? 500
              : parseInt(formData.numeroEmpleados.split("-")[0]) || undefined,
          ubicacion: formData.ubicacion,
          subSectorId: formData.subsector,
          SubSector: selectedSubSector || null,
        });

        // Hacer una sola llamada que actualice todo
        const preClientPromise = editLeadByIdAndCreatePreClient(
          formDataToSend,
          pendingLeadUpdate.leadId
        );

        toast.promise(preClientPromise, {
          loading: "Guardando cambios...",
          success: () =>
            `Lead actualizado a Contacto Cálido con información adicional`,
          error: () => {
            // Revertir el cambio si hay un error
            updateLeadInState(pendingLeadUpdate.leadId, {
              status: pendingLeadUpdate.leadToUpdate.status,
            });
            return `Error al actualizar`;
          },
        });

        setShowContactoCalidoDialog(false);
        setPendingLeadUpdate(null);
      }
    },
    [pendingLeadUpdate, subSectores, updateLeadInState]
  );

  const handleContactoCalidoCancel = useCallback(() => {
    setShowContactoCalidoDialog(false);
    setPendingLeadUpdate(null);
  }, []);

  // Función auxiliar para encontrar un lead por ID a través de todos los estados
  const findLeadById = useCallback(
    (leadId: string): LeadWithRelations | undefined => {
      for (const status of Object.keys(leadsData) as LeadStatus[]) {
        const lead = leadsData[status].find((lead) => lead.id === leadId);
        if (lead) return lead;
      }
      return undefined;
    },
    [leadsData]
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const lead = findLeadById(active.id as string);
      if (lead) {
        setActiveLead(lead);
        setActiveId(active.id as string);
      }
    },
    [findLeadById]
  );

  // Función para verificar si el lead ya tiene los datos requeridos para ContactoCalido
  const hasContactoCalidoData = useCallback(
    (lead: LeadWithRelations): boolean => {
      return !!(lead.numero_empleados && lead.ubicacion && lead.subSectorId);
    },
    []
  );

  const updateLeadStatus = useCallback(
    async (
      leadId: string,
      newStatus: LeadStatus,
      leadToUpdate: LeadWithRelations
    ) => {
      // Actualizar optimistamente el estado local
      updateLeadInState(leadId, { status: newStatus });

      // llamar accion para ACTUALIZAR lead
      const formData = new FormData();
      formData.append("status", newStatus);

      const promise = editLeadById(leadId, formData);

      toast.promise(promise, {
        loading: "Guardando cambios...",
        success: () => `Lead actualizado a ${newStatus}`,
        error: () => {
          // Revertir el cambio si hay un error
          updateLeadInState(leadId, { status: leadToUpdate.status });
          return `Error al actualizar`;
        },
      });

      if (newStatus === LeadStatus.Asignadas) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 10000);
      }
    },
    [updateLeadInState]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      setActiveId(null);
      setActiveLead(null);

      if (!over) return;

      const leadId = active.id as string;
      const newStatus = over.id as LeadStatus;

      const leadToUpdate = findLeadById(leadId);

      if (leadToUpdate && leadToUpdate.status !== newStatus) {
        // Si se intenta mover a ContactoCalido, verificar si ya tiene los datos requeridos
        if (newStatus === LeadStatus.ContactoCalido) {
          // Si ya tiene los datos requeridos, proceder directamente
          if (hasContactoCalidoData(leadToUpdate)) {
            await updateLeadStatus(leadId, newStatus, leadToUpdate);
            return;
          }

          // Si no tiene los datos, mostrar el dialog
          setPendingLeadUpdate({
            leadId,
            newStatus,
            leadToUpdate,
          });
          setShowContactoCalidoDialog(true);
          return;
        }

        // Para otros estados, proceder normalmente
        await updateLeadStatus(leadId, newStatus, leadToUpdate);
      }
    },
    [findLeadById, hasContactoCalidoData, updateLeadStatus]
  );

  // Contar el total de leads - memoizado
  const totalLeads = useMemo(
    () =>
      Object.values(leadsData).reduce(
        (total, leads) => total + leads.length,
        0
      ),
    [leadsData]
  );

  // Memoizar el contenido de filtros activos
  const hasActiveFilters = useMemo(
    () =>
      filters.generadorId ||
      filters.fechaCreacion?.from ||
      filters.fechaCreacion?.to ||
      filters.oficina ||
      filters.searchTerm,
    [filters]
  );

  return (
    <div className="flex flex-col  h-[calc(100vh-170px)]">
      {showConfetti && (
        <Confetti
          numberOfPieces={350}
          wind={0.1}
          initialVelocityY={3}
          width={width}
          height={height}
          gravity={0.5}
        />
      )}

      <KanbanFilters
        onFilterChange={handleFilterChange}
        generadores={generadores}
        initialLeads={Object.values(initialLeadsData).flat()}
      />

      {/* Filter status indicator */}
      {hasActiveFilters ? (
        <div className="px-4 py-2 flex flex-wrap gap-2 text-black text-sm items-center">
          <span>Mostrando {totalLeads} leads</span>

          {filters.searchTerm && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 px-3 py-1"
            >
              <span>Búsqueda: {filters.searchTerm}</span>
              <X
                className="size-4 ml-1 cursor-pointer hover:text-red-500"
                onClick={() => clearSingleFilter("searchTerm")}
              />
            </Badge>
          )}

          {filters.generadorId && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 px-3 py-1"
            >
              <span>
                Generador:{" "}
                {generadores.find((g) => g.id === filters.generadorId)?.name}
              </span>
              <X
                className="size-4 ml-1 cursor-pointer hover:text-red-500"
                onClick={() => clearSingleFilter("generadorId")}
              />
            </Badge>
          )}

          {filters.oficina && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 px-3 py-1"
            >
              <span>Oficina: {filters.oficina}</span>
              <X
                className="size-4 ml-1 cursor-pointer hover:text-red-500"
                onClick={() => clearSingleFilter("oficina")}
              />
            </Badge>
          )}

          {filters.fechaCreacion?.from || filters.fechaCreacion?.to ? (
            <Badge
              variant="outline"
              className="flex items-center gap-1 px-3 py-1"
            >
              <span>
                Fecha:{" "}
                {filters.fechaCreacion?.from && filters.fechaCreacion?.to
                  ? `${format(
                      new Date(filters.fechaCreacion.from),
                      "dd/MM/yyyy"
                    )} - ${format(
                      new Date(filters.fechaCreacion.to),
                      "dd/MM/yyyy"
                    )}`
                  : filters.fechaCreacion?.from
                  ? `Desde ${format(
                      new Date(filters.fechaCreacion.from),
                      "dd/MM/yyyy"
                    )}`
                  : `Hasta ${format(
                      new Date(filters.fechaCreacion.to!),
                      "dd/MM/yyyy"
                    )}`}
              </span>
              <X
                className="size-4 ml-1 cursor-pointer hover:text-red-500"
                onClick={() => clearSingleFilter("fechaCreacion")}
              />
            </Badge>
          ) : null}
        </div>
      ) : null}

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCorners}
      >
        <div className="flex-1 overflow-x-auto scroll-hide pt-4 h-[calc(80vh-1400px)]">
          <div className="flex gap-14 h-full">
            {Object.entries(leadsData).map(([status, leads], index) => (
              <DroppableKanbanColumn
                key={status}
                status={status as LeadStatus}
                leads={leads}
                setSelectedTask={setSelectedTask}
                showCreateLeadForm={index === 0}
                generadores={generadores}
                hasMore={paginationInfo[status as LeadStatus]?.hasMore || false}
                isLoading={loadingStates[status as LeadStatus] || false}
                onLoadMore={() => loadMoreLeads(status as LeadStatus)}
                updateLeadInState={updateLeadInState}
              />
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeId && activeLead && (
            <Card className="w-[280px] p-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg">
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-sm">{activeLead.empresa}</h3>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center">
                    <TagIcon className="h-3 w-3 mr-1" />
                    {activeLead.sector.nombre}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </DragOverlay>
      </DndContext>

      {/* Dialog para ContactoCalido */}
      <ContactoCalidoDialog
        open={showContactoCalidoDialog}
        onOpenChange={setShowContactoCalidoDialog}
        lead={pendingLeadUpdate?.leadToUpdate || null}
        onConfirm={handleContactoCalidoConfirm}
        onCancel={handleContactoCalidoCancel}
        subSectores={subSectores}
      />
    </div>
  );
}
