import { useEffect } from "react";
import { useVacancyStats } from "@/hooks/vacancy/useVacancyStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  BarChart3,
  Clock,
  User,
  TrendingUp,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

interface VacancyStatsExampleProps {
  vacancyId: string;
}

/**
 * Componente de ejemplo que demuestra todas las funcionalidades
 * del hook useVacancyStats para el historial de vacantes
 */
export const VacancyStatsExample = ({
  vacancyId,
}: VacancyStatsExampleProps) => {
  const {
    // Estados
    isLoading,
    error,
    history,
    stats,
    averageTimeByStatus,

    // Funciones
    getVacancyHistory,
    getVacancyStats,
    getAllVacancyData,
    clearData,
  } = useVacancyStats(vacancyId);

  // Cargar datos automáticamente cuando cambia el vacancyId
  useEffect(() => {
    if (vacancyId) {
      getAllVacancyData();
    }
  }, [vacancyId, getAllVacancyData]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Cargando estadísticas de la vacante...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-500">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Controles del Hook
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={getVacancyHistory}
              disabled={isLoading}
            >
              Solo Historial
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={getVacancyStats}
              disabled={isLoading}
            >
              Solo Estadísticas
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={getAllVacancyData}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Recargar Todo
            </Button>
            <Button variant="destructive" size="sm" onClick={clearData}>
              Limpiar Datos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas de tiempo promedio */}
      {averageTimeByStatus && Object.keys(averageTimeByStatus).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              Tiempo Promedio por Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(averageTimeByStatus).map(([status, days]) => (
                <div
                  key={status}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{status}</span>
                    <span className="text-xs text-gray-500">Estado</span>
                  </div>
                  <div className="flex items-center gap-1 text-lg font-bold text-blue-600">
                    <Clock className="h-4 w-4" />
                    {days} días
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumen de estadísticas */}
      {stats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5" />
              Resumen de Cambios de Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.status}
                  className="flex flex-col items-center p-4 bg-white border rounded-lg"
                >
                  <Badge variant="secondary" className="mb-2">
                    {stat.status}
                  </Badge>
                  <span className="text-2xl font-bold text-gray-800">
                    {stat._count.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    cambio{stat._count.status !== 1 ? "s" : ""}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Historial cronológico detallado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            Historial Cronológico Completo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay historial disponible para esta vacante</p>
              <p className="text-sm">Los cambios de estado aparecerán aquí</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((record, index) => (
                <Card key={record.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge
                            variant={index === 0 ? "default" : "secondary"}
                            className="text-sm"
                          >
                            {record.status}
                          </Badge>
                          {index === 0 && (
                            <Badge variant="outline" className="text-xs">
                              Estado Actual
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <div>
                              <p className="font-medium">
                                {format(new Date(record.changedAt), "PPP", {
                                  locale: es,
                                })}
                              </p>
                              <p className="text-xs opacity-75">
                                {format(new Date(record.changedAt), "p", {
                                  locale: es,
                                })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-gray-600">
                            <User className="h-4 w-4" />
                            <div>
                              <p className="font-medium">
                                {record.changedBy.name}
                              </p>
                              <p className="text-xs opacity-75">
                                {record.changedBy.role}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información de debug (solo en desarrollo) */}
      {process.env.NODE_ENV === "development" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">
              Debug Info (solo en desarrollo)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs space-y-2 font-mono">
              <p>
                <strong>Vacancy ID:</strong> {vacancyId}
              </p>
              <p>
                <strong>Records en historial:</strong> {history.length}
              </p>
              <p>
                <strong>Estados únicos:</strong> {stats.length}
              </p>
              <p>
                <strong>Tiempo promedio calculado:</strong>{" "}
                {averageTimeByStatus ? "Sí" : "No"}
              </p>
              <p>
                <strong>Estado de carga:</strong>{" "}
                {isLoading ? "Cargando" : "Completo"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
