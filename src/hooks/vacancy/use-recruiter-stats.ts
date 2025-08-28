import { useState, useCallback } from "react";
import {
  getRecruiterPlacementStats,
  getRecruiterGeneralStats,
} from "@/actions/vacantes/actions";

export type PeriodType = "last_month" | "last_6_months" | "year" | "quarter";

interface PlacementData {
  period: string;
  placements: number;
  label: string;
}

interface GeneralStats {
  totalVacancies: number;
  totalPlacements: number;
  activeVacancies: number;
  placementRate: number;
  averageDaysToPlacement: number;
}

export const useRecruiterStats = (recruiterId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placementData, setPlacementData] = useState<PlacementData[]>([]);
  const [generalStats, setGeneralStats] = useState<GeneralStats | null>(null);
  const [currentPeriod, setCurrentPeriod] = useState<PeriodType>("last_month");
  const [totalPlacements, setTotalPlacements] = useState(0);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | null>(
    null
  );

  const fetchPlacementStats = useCallback(
    async (period: PeriodType, year?: number, quarter?: 1 | 2 | 3 | 4) => {
      if (!recruiterId) return;

      setIsLoading(true);
      setError(null);

      try {
        const result = await getRecruiterPlacementStats(
          recruiterId,
          period,
          year,
          quarter
        );

        if (result.ok) {
          setPlacementData(result.data);
          setTotalPlacements(result.totalPlacements || 0);
          setDateRange(result.dateRange || null);
          setCurrentPeriod(period);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError("Error al obtener estadísticas de placements");
        console.error("Error fetching placement stats:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [recruiterId]
  );

  const fetchGeneralStats = useCallback(async () => {
    if (!recruiterId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await getRecruiterGeneralStats(recruiterId);

      if (result.ok) {
        setGeneralStats(result.stats);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Error al obtener estadísticas generales");
      console.error("Error fetching general stats:", err);
    } finally {
      setIsLoading(false);
    }
  }, [recruiterId]);

  const fetchAllStats = useCallback(
    async (
      period: PeriodType = "last_month",
      year?: number,
      quarter?: 1 | 2 | 3 | 4
    ) => {
      if (!recruiterId) return;

      setIsLoading(true);
      setError(null);

      try {
        const [placementResult, generalResult] = await Promise.all([
          getRecruiterPlacementStats(recruiterId, period, year, quarter),
          getRecruiterGeneralStats(recruiterId),
        ]);

        if (placementResult.ok) {
          setPlacementData(placementResult.data);
          setTotalPlacements(placementResult.totalPlacements || 0);
          setDateRange(placementResult.dateRange || null);
          setCurrentPeriod(period);
        } else {
          setError(placementResult.message);
        }

        if (generalResult.ok) {
          setGeneralStats(generalResult.stats);
        } else if (!error) {
          setError(generalResult.message);
        }
      } catch (err) {
        setError("Error al obtener estadísticas");
        console.error("Error fetching all stats:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [recruiterId, error]
  );

  const clearData = useCallback(() => {
    setPlacementData([]);
    setGeneralStats(null);
    setTotalPlacements(0);
    setDateRange(null);
    setError(null);
  }, []);

  return {
    // Estados
    isLoading,
    error,
    placementData,
    generalStats,
    currentPeriod,
    totalPlacements,
    dateRange,

    // Funciones
    fetchPlacementStats,
    fetchGeneralStats,
    fetchAllStats,
    clearData,
  };
};
