import { useState, useCallback, useRef } from "react";
import { LeadStatus, Oficina } from "@prisma/client";
import { Prisma } from "@prisma/client";

// Definir tipos localmente por ahora
export type LeadWithRelations = Prisma.LeadGetPayload<{
  include: {
    sector: true;
    origen: true;
    generadorLeads: true;
    SubSector: true;
    contactos: {
      include: {
        interactions: {
          include: {
            contacto: true;
            autor: true;
            linkedTasks: true;
          };
        };
      };
    };
    statusHistory: {
      include: {
        changedBy: true;
      };
    };
  };
}>;

export interface FilterState {
  generadorId: string | null;
  fechaCreacion: { from: Date | null; to: Date | null };
  oficina: Oficina | null;
  searchTerm: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
}

interface UseInfiniteLeadsReturn {
  leadsData: Record<LeadStatus, LeadWithRelations[]>;
  paginationInfo: Record<LeadStatus, PaginationInfo>;
  loadingStates: Record<LeadStatus, boolean>;
  loadMoreLeads: (status: LeadStatus) => Promise<void>;
  refreshLeads: (filters?: FilterState) => Promise<void>;
  updateLeadInState: (
    leadId: string,
    updates: Partial<LeadWithRelations>
  ) => void;
}

export function useInfiniteLeads(
  initialLeadsData: Record<LeadStatus, LeadWithRelations[]>,
  initialPaginationInfo: Record<LeadStatus, PaginationInfo>
): UseInfiniteLeadsReturn {
  const [leadsData, setLeadsData] =
    useState<Record<LeadStatus, LeadWithRelations[]>>(initialLeadsData);
  const [paginationInfo, setPaginationInfo] = useState<
    Record<LeadStatus, PaginationInfo>
  >(initialPaginationInfo);
  const [loadingStates, setLoadingStates] = useState<
    Record<LeadStatus, boolean>
  >(() => {
    const initialState = {} as Record<LeadStatus, boolean>;
    Object.values(LeadStatus).forEach((status) => {
      initialState[status] = false;
    });
    return initialState;
  });

  // Usar ref para almacenar los filtros actuales
  const currentFiltersRef = useRef<FilterState | undefined>(undefined);

  // Controladores para abortar fetch por estado y de refresco
  const loadControllersRef = useRef<
    Partial<Record<LeadStatus, AbortController>>
  >({});
  const refreshControllersRef = useRef<
    Partial<Record<LeadStatus, AbortController>>
  >({});

  const buildQueryParams = useCallback(
    (status: LeadStatus, page: number, filters?: FilterState) => {
      const params = new URLSearchParams({
        status,
        page: page.toString(),
        limit: "50",
      });

      if (filters?.generadorId) {
        params.append("generadorId", filters.generadorId);
      }
      if (filters?.oficina) {
        params.append("oficina", filters.oficina);
      }
      if (filters?.searchTerm) {
        params.append("searchTerm", filters.searchTerm);
      }
      if (filters?.fechaCreacion?.from) {
        params.append("fechaDesde", filters.fechaCreacion.from.toISOString());
      }
      if (filters?.fechaCreacion?.to) {
        params.append("fechaHasta", filters.fechaCreacion.to.toISOString());
      }

      return params;
    },
    []
  );

  const loadMoreLeads = useCallback(
    async (status: LeadStatus) => {
      const currentPagination = paginationInfo[status];

      if (!currentPagination.hasMore || loadingStates[status]) {
        return;
      }

      setLoadingStates((prev) => ({ ...prev, [status]: true }));

      // Abortar cualquier solicitud previa de este status
      try {
        loadControllersRef.current[status]?.abort();
      } catch {}

      const controller = new AbortController();
      loadControllersRef.current[status] = controller;

      try {
        const nextPage = currentPagination.page + 1;
        const params = buildQueryParams(
          status,
          nextPage,
          currentFiltersRef.current
        );

        const response = await fetch(`/api/leads/kanban?${params}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Error loading more leads");
        }

        const data = await response.json();

        setLeadsData((prev) => ({
          ...prev,
          [status]: [...prev[status], ...data.leads],
        }));

        setPaginationInfo((prev) => ({
          ...prev,
          [status]: data.pagination,
        }));
      } catch (error: any) {
        if (error?.name !== "AbortError") {
          console.error("Error loading more leads:", error);
        }
      } finally {
        setLoadingStates((prev) => ({ ...prev, [status]: false }));
        // Limpiar controller
        delete loadControllersRef.current[status];
      }
    },
    [paginationInfo, loadingStates, buildQueryParams]
  );

  const refreshLeads = useCallback(
    async (filters?: FilterState) => {
      currentFiltersRef.current = filters;

      // Si hay filtros, necesitamos recargar desde la API
      if (
        filters &&
        (filters.generadorId ||
          filters.oficina ||
          filters.searchTerm ||
          filters.fechaCreacion?.from ||
          filters.fechaCreacion?.to)
      ) {
        // Resetear todos los estados de carga
        setLoadingStates(() => {
          const loadingState = {} as Record<LeadStatus, boolean>;
          Object.values(LeadStatus).forEach((status) => {
            loadingState[status] = true;
          });
          return loadingState;
        });

        // Abortar cualquier solicitud de refresco previa
        Object.values(LeadStatus).forEach((status) => {
          try {
            refreshControllersRef.current[status]?.abort();
          } catch {}
        });

        try {
          // Cargar datos para cada estado en paralelo con cancelación
          const promises = Object.values(LeadStatus).map(async (status) => {
            const controller = new AbortController();
            refreshControllersRef.current[status] = controller;
            const params = buildQueryParams(status, 1, filters);
            const response = await fetch(`/api/leads/kanban?${params}`, {
              signal: controller.signal,
            });
            if (!response.ok) {
              throw new Error(`Error loading leads for status ${status}`);
            }
            return { status, data: await response.json() };
          });

          const results = await Promise.allSettled(promises);

          const newLeadsData: Record<LeadStatus, LeadWithRelations[]> =
            {} as any;
          const newPaginationInfo: Record<LeadStatus, PaginationInfo> =
            {} as any;

          results.forEach((result, idx) => {
            const status = Object.values(LeadStatus)[idx];
            if (result.status === "fulfilled") {
              const data = result.value.data;
              newLeadsData[status] = data.leads;
              newPaginationInfo[status] = data.pagination;
            } else {
              // Si falló (o se abortó), mantener los existentes
              newLeadsData[status] = [] as any;
              newPaginationInfo[status] = {
                page: 1,
                limit: 50,
                totalCount: 0,
                totalPages: 0,
                hasMore: false,
              };
            }
          });

          setLeadsData(newLeadsData);
          setPaginationInfo(newPaginationInfo);
        } catch (error) {
          console.error("Error refreshing leads:", error);
        } finally {
          setLoadingStates(() => {
            const loadingState = {} as Record<LeadStatus, boolean>;
            Object.values(LeadStatus).forEach((status) => {
              loadingState[status] = false;
            });
            return loadingState;
          });
          // Limpiar controllers
          refreshControllersRef.current = {};
        }
      } else {
        // Sin filtros, usar datos iniciales
        setLeadsData(initialLeadsData);
        setPaginationInfo(initialPaginationInfo);
      }
    },
    [initialLeadsData, initialPaginationInfo, buildQueryParams]
  );

  const updateLeadInState = useCallback(
    (leadId: string, updates: Partial<LeadWithRelations>) => {
      setLeadsData((prev) => {
        const newData = { ...prev };

        // Buscar y actualizar el lead en cualquier estado
        Object.keys(newData).forEach((status) => {
          const statusKey = status as LeadStatus;
          const leadIndex = newData[statusKey].findIndex(
            (lead) => lead.id === leadId
          );
          if (leadIndex !== -1) {
            newData[statusKey] = [...newData[statusKey]];
            newData[statusKey][leadIndex] = {
              ...newData[statusKey][leadIndex],
              ...updates,
            };
          }
        });

        return newData;
      });
    },
    []
  );

  return {
    leadsData,
    paginationInfo,
    loadingStates,
    loadMoreLeads,
    refreshLeads,
    updateLeadInState,
  };
}
