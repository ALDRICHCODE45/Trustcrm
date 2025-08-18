import { getVacancyDetails } from "@/actions/vacantes/actions";
import {
  ValidateChecklistAction,
  ValidatePerfilMuestraAction,
} from "@/actions/vacantes/checklist/actions";
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

  const validateChecklist = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!vacancyId) return;
      const response = await ValidateChecklistAction(vacancyId);
      if (!response.ok) {
        setError("Error al validar el checklist");
      }
    } catch (e) {
      setError("Error al validar el checklist");
    } finally {
      setIsLoading(false);
    }
  }, [vacancyId]);

  const validatePerfilMuestra = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!vacancyId) return;
      const response = await ValidatePerfilMuestraAction(vacancyId);
      if (!response.ok) {
        setError("Error al validar el perfil muestra");
        return;
      }
    } catch (e) {
      setError("Error al validar el perfil muestra");
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
    validateChecklist,
    validatePerfilMuestra,
  };
};
