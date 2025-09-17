"use client";

import { useState, useEffect } from "react";
import { ReportFilters } from "./components/ReportFilters";
import { ReportTable } from "./components/ReportTable";
import { ReportSummary } from "./components/ReportSummary";
import { createReportColumns } from "./components/ReportColumns";
import { LeadDetailsModal } from "./components/LeadDetailsModal";
import {
  getLeadReports,
  getLeadGenerators,
  getLeadReportSummary,
  LeadReportData,
  LeadDetail,
} from "@/actions/leads/reports";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, FileText } from "lucide-react";

interface ReportFilters {
  generadorId?: string;
  fechaInicio: Date;
  fechaFin: Date;
}

export default function ReportesPage() {
  const [reportData, setReportData] = useState<LeadReportData[]>([]);
  const [generadores, setGeneradores] = useState<
    Array<{ id: string; name: string; email: string }>
  >([]);
  const [summary, setSummary] = useState({
    totalGeneradores: 0,
    totalContactos: 0,
    totalSocialSelling: 0,
    totalContactoCalido: 0,
    totalCitaAgendada: 0,
    totalCitaAtendida: 0,
    totalCitaValidada: 0,
    totalAsignadas: 0,
    totalGeneral: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasGeneratedReport, setHasGeneratedReport] = useState(false);

  // Estado para el modal de detalles
  const [modalState, setModalState] = useState({
    isOpen: false,
    leads: [] as LeadDetail[],
    estado: "",
    generadorName: "",
    periodo: "",
  });

  // Cargar generadores al montar el componente
  useEffect(() => {
    const loadGeneradores = async () => {
      try {
        const data = await getLeadGenerators();
        setGeneradores(data);
      } catch (error) {
        console.error("Error al cargar generadores:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los generadores de leads",
          variant: "destructive",
        });
      }
    };

    loadGeneradores();
  }, []);

  // Función para mostrar detalles de leads
  const handleShowDetails = (
    leads: LeadDetail[],
    estado: string,
    generadorName: string,
    periodo: string
  ) => {
    setModalState({
      isOpen: true,
      leads,
      estado,
      generadorName,
      periodo,
    });
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      leads: [],
      estado: "",
      generadorName: "",
      periodo: "",
    });
  };

  const handleFiltersChange = async (filters: ReportFilters) => {
    setIsLoading(true);
    try {
      const [reportResult, summaryResult] = await Promise.all([
        getLeadReports(filters),
        getLeadReportSummary(filters),
      ]);

      setReportData(reportResult);
      setSummary(summaryResult);
      setHasGeneratedReport(true);

      toast({
        title: "Reporte generado",
        description: `Se generó el reporte con ${reportResult.length} registros`,
      });
    } catch (error) {
      console.error("Error al generar reporte:", error);
      toast({
        title: "Error",
        description: "No se pudo generar el reporte. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Crear columnas dinámicas con funcionalidad de drill-down
  const columns = createReportColumns({ onShowDetails: handleShowDetails });

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}

      {/* Filtros */}
      <ReportFilters
        generadores={generadores}
        onFiltersChange={handleFiltersChange}
        isLoading={isLoading}
      />

      {/* Contenido del reporte */}
      {hasGeneratedReport && (
        <>
          {/* Resumen */}
          <ReportSummary summary={summary} />

          {/* Tabla de datos */}
          <ReportTable
            columns={columns}
            data={reportData}
            isLoading={isLoading}
          />
        </>
      )}

      {/* Estado inicial */}
      {!hasGeneratedReport && !isLoading && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="p-12 text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Genera tu primer reporte
            </h3>
            <p className="text-gray-400 mb-4 max-w-md mx-auto">
              Selecciona los filtros deseados y haz clic en Generar Reporte para
              ver toda la actividad de leads durante el período seleccionado.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <TrendingUp className="h-4 w-4" />
              <span>
                Muestra creaciones y cambios de estado durante el período
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de detalles de leads */}
      <LeadDetailsModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        leads={modalState.leads}
        estado={modalState.estado}
        generadorName={modalState.generadorName}
        periodo={modalState.periodo}
      />
    </div>
  );
}
