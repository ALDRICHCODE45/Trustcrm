"use client";
import { useState, useEffect } from "react";
import { ReportFilters } from "./components/ReportFilters";
import { ReportTable } from "./components/ReportTable";
import { ReportSummary } from "./components/ReportSummary";
import { createReportColumns } from "./components/ReportColumns";
import { VacancyDetailsModal } from "./components/VacancyDetailsModal";
import {
  getVacancyReports,
  getRecruiters,
  getVacancyReportSummary,
  VacancyReportData,
  VacancyDetail,
} from "@/actions/vacantes/reports";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, FileText } from "lucide-react";
import { toast } from "sonner";

interface ReportFilters {
  reclutadorId?: string;
  fechaInicio: Date;
  fechaFin: Date;
}

export default function ReportesPage() {
  const [reportData, setReportData] = useState<VacancyReportData[]>([]);
  const [reclutadores, setReclutadores] = useState<
    Array<{ id: string; name: string; email: string }>
  >([]);
  const [summary, setSummary] = useState({
    totalReclutadores: 0,
    totalQuickMeeting: 0,
    totalHunting: 0,
    totalEntrevistas: 0,
    totalPrePlacement: 0,
    totalPlacement: 0,
    totalCancelada: 0,
    totalPerdida: 0,
    totalStandBy: 0,
    totalGeneral: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasGeneratedReport, setHasGeneratedReport] = useState(false);

  // Estado para el modal de detalles
  const [modalState, setModalState] = useState({
    isOpen: false,
    vacancies: [] as VacancyDetail[],
    estado: "",
    reclutadorName: "",
    periodo: "",
  });

  // Cargar reclutadores al montar el componente
  useEffect(() => {
    const loadReclutadores = async () => {
      try {
        const data = await getRecruiters();
        setReclutadores(data);
      } catch (error) {
        console.error("Error al cargar reclutadores:", error);
        toast.message("Error", {
          description: "No se pudieron cargar los reclutadores",
        });
      }
    };

    loadReclutadores();
  }, []);

  // Función para mostrar detalles de vacantes
  const handleShowDetails = (
    vacancies: VacancyDetail[],
    estado: string,
    reclutadorName: string,
    periodo: string
  ) => {
    setModalState({
      isOpen: true,
      vacancies,
      estado,
      reclutadorName,
      periodo,
    });
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      vacancies: [],
      estado: "",
      reclutadorName: "",
      periodo: "",
    });
  };

  const handleFiltersChange = async (filters: ReportFilters) => {
    setIsLoading(true);
    try {
      const [reportResult, summaryResult] = await Promise.all([
        getVacancyReports(filters),
        getVacancyReportSummary(filters),
      ]);

      setReportData(reportResult);
      setSummary(summaryResult);
      setHasGeneratedReport(true);

      toast.message("Reporte generado", {
        description: `Se generó el reporte con ${reportResult.length} registros`,
      });
    } catch (error) {
      console.error("Error al generar reporte:", error);
      toast.message("Error", {
        description: `No se pudo generar el reporte. Intenta nuevamente.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Crear columnas dinámicas con funcionalidad de drill-down
  const columns = createReportColumns({ onShowDetails: handleShowDetails });

  return (
    <div className="p-6 space-y-6  min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold ">Reportes de Reclutamiento</h1>
          <p className="text-gray-700 mt-1">
            Analiza el rendimiento de vacantes y reclutadores en períodos
            específicos
          </p>
        </div>
      </div>

      {/* Filtros */}
      <ReportFilters
        reclutadores={reclutadores}
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
        <Card className="border-dashed border-2 border-gray-700">
          <CardContent className="p-12 text-center">
            <div className="mx-auto mb-4 w-16 h-16  rounded-full flex items-center justify-center">
              <FileText className="h-8 w-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Genera tu primer reporte
            </h3>
            <p className="text-gray-600 mb-4 max-w-md mx-auto">
              Selecciona los filtros deseados y haz clic en Generar Reporte para
              ver toda la actividad de vacantes durante el período seleccionado.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <TrendingUp className="h-4 w-4" />
              <span>
                Muestra creaciones y cambios de estado durante el período
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de detalles de vacantes */}
      <VacancyDetailsModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        vacancies={modalState.vacancies}
        estado={modalState.estado}
        reclutadorName={modalState.reclutadorName}
        periodo={modalState.periodo}
      />
    </div>
  );
}
