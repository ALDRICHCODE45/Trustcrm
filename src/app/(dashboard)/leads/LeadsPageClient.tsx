"use client";
import { useCallback, useMemo } from "react";
import { createLeadsColumns } from "../list/leads/leadsColumns";
import { CommercialTable } from "./table/CommercialTable";
import { CreateLeadForm } from "../list/leads/components/CreateLeadForm";
import { LeadWithRelations } from "./kanban/page";
import { ToastAlerts } from "@/components/ToastAlerts";
import { useRouter } from "next/navigation";
import { LeadOrigen, Role } from "@prisma/client";
import { useHybridPaginationLeads } from "@/hooks/use-hybrid-pagination-leads";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface LeadsPageClientProps {
  initialData?: LeadWithRelations[];
  generadores: any[];
  sectores: any[];
  origenes: LeadOrigen[];
  isAdmin: boolean;
  activeUser: { name: string; id: string; role: Role };
}

export function LeadsPageClient({
  initialData = [],
  generadores,
  sectores,
  origenes,
  isAdmin,
  activeUser,
}: LeadsPageClientProps) {
  const router = useRouter();

  // Hook para paginación híbrida (carga 200, muestra 10 por página)
  const {
    currentPageData,
    loading,
    isFiltering,
    error,
    currentPage,
    totalPages,
    pageSize,
    totalLocalRecords,
    totalServerRecords,
    hasMoreInServer,
    goToPage,
    setPageSize,
    updateParams,
    refetch,
    currentParams,
    updateLeadInState,
  } = useHybridPaginationLeads({
    pageSize: 10, // Mostrar 10 por página
    prefetchSize: 200, // Cargar 200 del servidor por vez
  });

  // Crear las columnas dinámicamente con la función de actualización
  const columns = useMemo(() => {
    return createLeadsColumns(updateLeadInState);
  }, [updateLeadInState]);

  // Callback cuando se crea un nuevo lead
  const handleLeadCreated = useCallback(() => {
    refetch(); // Actualizar datos del servidor en lugar de router.refresh()
  }, [refetch]);

  // Mostrar error si hay problemas de conectividad
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card className="border-destructive">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-destructive">
                  Error al cargar datos
                </h3>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button onClick={refetch} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <ToastAlerts />

      {/* Header con botones de acción */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center gap-2">
          <CreateLeadForm
            isAdmin={isAdmin}
            activeUser={activeUser}
            sectores={sectores}
            generadores={generadores}
            origenes={origenes}
            onLeadCreated={handleLeadCreated}
          />
        </div>
      </div>

      {/* Tabla con paginación híbrida */}
      <CommercialTable
        columns={columns}
        data={currentPageData}
        generadores={generadores}
        origenes={origenes}
        defaultPageSize={pageSize}
        filterPlaceholder="Buscar leads..."
        hybridPagination={{
          currentPage,
          totalPages,
          totalLocalRecords,
          totalServerRecords,
          hasMoreInServer,
          pageSize,
          goToPage,
          setPageSize,
        }}
        onHybridParamsChange={updateParams}
        currentHybridParams={currentParams}
        isHybridLoading={loading}
        isFiltering={isFiltering}
        onHybridRefresh={refetch}
        updateLeadInState={updateLeadInState}
      />
    </>
  );
}
