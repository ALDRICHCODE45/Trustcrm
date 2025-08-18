import { VacancyEstado } from "@prisma/client";
import { VacancyWithRelations } from "@/app/(dashboard)/reclutador/components/ReclutadorColumns";
import {
  validateStateTransition,
  getStateValidationDescription,
  requiresValidation,
  ValidationResult,
} from "@/lib/vacancyStateValidations";

/**
 * Hook personalizado para manejar validaciones de estado de vacantes
 */
export function useVacancyValidation() {
  /**
   * Valida si una vacante puede cambiar a un estado específico
   */
  const validateTransition = (
    vacancy: VacancyWithRelations,
    targetState: VacancyEstado
  ): ValidationResult => {
    return validateStateTransition(vacancy, targetState);
  };

  /**
   * Obtiene la descripción de validación para un estado
   */
  const getValidationDescription = (
    state: VacancyEstado
  ): string | undefined => {
    return getStateValidationDescription(state);
  };

  /**
   * Verifica si un estado requiere validación especial
   */
  const stateRequiresValidation = (state: VacancyEstado): boolean => {
    return requiresValidation(state);
  };

  /**
   * Obtiene todos los estados que una vacante puede alcanzar actualmente
   */
  const getAvailableStates = (
    vacancy: VacancyWithRelations
  ): VacancyEstado[] => {
    const allStates = Object.values(VacancyEstado);

    return allStates.filter((state) => {
      if (state === vacancy.estado) return false; // No incluir el estado actual

      const validation = validateStateTransition(vacancy, state);
      return validation.isValid;
    });
  };

  /**
   * Obtiene todos los estados bloqueados con sus razones
   */
  const getBlockedStates = (
    vacancy: VacancyWithRelations
  ): Array<{
    state: VacancyEstado;
    reason: string;
  }> => {
    const allStates = Object.values(VacancyEstado);

    return allStates
      .filter((state) => state !== vacancy.estado)
      .map((state) => ({
        state,
        validation: validateStateTransition(vacancy, state),
      }))
      .filter(({ validation }) => !validation.isValid)
      .map(({ state, validation }) => ({
        state,
        reason:
          validation.reason ||
          validation.message ||
          "No se puede cambiar a este estado",
      }));
  };

  return {
    validateTransition,
    getValidationDescription,
    stateRequiresValidation,
    getAvailableStates,
    getBlockedStates,
  };
}
