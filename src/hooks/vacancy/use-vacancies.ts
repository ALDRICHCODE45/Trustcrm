import { getVacancies, getVacancyDetails } from "@/actions/vacantes/actions";
import {
  completePerfilMuestraAndNotify,
  requestChecklistValidationAction,
  ValidateChecklistAction,
  ValidatePerfilMuestraAction,
} from "@/actions/vacantes/checklist/actions";
import { VacancyWithRelations } from "@/app/(dashboard)/reclutador/components/ReclutadorColumns";
import { useState, useCallback } from "react";

export const useVacancyDetails = (vacancyId?: string) => {
  const [vacancyDetails, setVacancyDetails] =
    useState<VacancyWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [vacancies, setVacancies] = useState<VacancyWithRelations[]>([]);

  const fetchAllVacancies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getVacancies();
      if (!response.ok) {
        setError(response.message);
        return;
      }
      setVacancies(response.vacancies);
    } catch (e) {
      setError("Error al obtener las vacantes");
      setVacancies([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  const requestPerfilMuestraValidation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!vacancyId) return;
      const response = await completePerfilMuestraAndNotify(vacancyId);
      if (!response.ok) {
        setError(
          response?.message ||
            "Error al solicitar la validación del perfil muestra"
        );
        return;
      }
    } catch (e) {
      setError("Error al solicitar la validación del perfil muestra");
    } finally {
      setIsLoading(false);
    }
  }, [vacancyId]);

  const requestChecklistValidation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!vacancyId) return;
      const response = await requestChecklistValidationAction(vacancyId);
      if (!response.ok) {
        setError("Error al solicitar la validación del checklist");
        return;
      }
    } catch (e) {
      setError("Error al solicitar la validación del checklist");
    } finally {
      setIsLoading(false);
    }
  }, [vacancyId]);

  return {
    //variables
    isLoading,
    error,
    vacancyDetails,
    vacancies,

    //metodos
    fetchVacancyDetails,
    validateChecklist,
    validatePerfilMuestra,
    fetchAllVacancies,
    requestPerfilMuestraValidation,
    requestChecklistValidation,
  };
};
