import { useState, useCallback } from "react";
import {
  getVacancyStatusHistory,
  getVacancyStatusStats,
} from "@/actions/vacantes/actions";
import { VacancyEstado } from "@prisma/client";

interface VacancyHistoryRecord {
  id: string;
  status: VacancyEstado;
  changedAt: Date;
  changedBy: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface VacancyStatsData {
  status: VacancyEstado;
  _count: {
    status: number;
  };
}

export const useVacancyStats = (vacancyId?: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<VacancyHistoryRecord[]>([]);
  const [stats, setStats] = useState<VacancyStatsData[]>([]);
  const [averageTimeByStatus, setAverageTimeByStatus] = useState<Record<
    string,
    number
  > | null>(null);

  const getVacancyHistory = useCallback(async () => {
    if (!vacancyId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await getVacancyStatusHistory(vacancyId);

      if (result.ok) {
        setHistory(result.history);
      } else {
        setError(result.message);
      }
    } catch (e) {
      setError("Error al obtener el historial de la vacante");
      console.error("Error fetching vacancy history:", e);
    } finally {
      setIsLoading(false);
    }
  }, [vacancyId]);

  const getVacancyStats = useCallback(async () => {
    if (!vacancyId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await getVacancyStatusStats(vacancyId);

      if (result.ok) {
        setStats(result.stats);
        setAverageTimeByStatus(result.averageTimeByStatus);
      } else {
        setError(result.message);
      }
    } catch (e) {
      setError("Error al obtener las estadísticas de la vacante");
      console.error("Error fetching vacancy stats:", e);
    } finally {
      setIsLoading(false);
    }
  }, [vacancyId]);

  const getAllVacancyData = useCallback(async () => {
    if (!vacancyId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Ejecutar ambas consultas en paralelo
      const [historyResult, statsResult] = await Promise.all([
        getVacancyStatusHistory(vacancyId),
        getVacancyStatusStats(vacancyId),
      ]);

      if (historyResult.ok) {
        setHistory(historyResult.history);
      } else {
        setError(historyResult.message);
      }

      if (statsResult.ok) {
        setStats(statsResult.stats);
        setAverageTimeByStatus(statsResult.averageTimeByStatus);
      } else if (!error) {
        // Solo establecer error si no hay uno previo
        setError(statsResult.message);
      }
    } catch (e) {
      setError("Error al obtener los datos de la vacante");
      console.error("Error fetching vacancy data:", e);
    } finally {
      setIsLoading(false);
    }
  }, [vacancyId, error]);

  // Función para limpiar los datos
  const clearData = useCallback(() => {
    setHistory([]);
    setStats([]);
    setAverageTimeByStatus(null);
    setError(null);
  }, []);

  return {
    // Valores
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
  };
};
