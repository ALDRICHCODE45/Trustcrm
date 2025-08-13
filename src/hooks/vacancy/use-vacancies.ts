import { getVacancyDetails } from "@/actions/vacantes/actions";
import { VacancyWithRelations } from "@/app/(dashboard)/reclutador/components/ReclutadorColumns";
import { useState, useCallback } from "react";

export const useVacancyDetails = (vacancyId: string) => {
  const [vacancyDetails, setVacancyDetails] =
    useState<VacancyWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVacancyDetails = useCallback(async () => {
    if (!vacancyId) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await getVacancyDetails(vacancyId);
      if (!response.ok) {
        setError(response.message);
        setVacancyDetails(null);
        return;
      }
      setVacancyDetails(response.vacancy);
    } catch (error) {
      setError("Error al obtener los detalles de la vacante");
      setVacancyDetails(null);
    } finally {
      setIsLoading(false);
    }
  }, [vacancyId]);

  return {
    //variables
    isLoading,
    error,
    vacancyDetails,

    //metodos
    fetchVacancyDetails,
  };
};
