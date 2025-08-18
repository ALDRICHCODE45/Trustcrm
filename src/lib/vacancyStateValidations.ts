import { VacancyEstado } from "@prisma/client";
import { VacancyWithRelations } from "@/app/(dashboard)/reclutador/components/ReclutadorColumns";

// Interfaz para el resultado de validación
export interface ValidationResult {
  isValid: boolean;
  message?: string;
  reason?: string;
}

// Interfaz para las reglas de validación de cada estado
interface StateValidationRule {
  targetState: VacancyEstado;
  validator: (vacancy: VacancyWithRelations) => ValidationResult;
  description: string;
}

// Definir las reglas de validación para cada estado
const stateValidationRules: StateValidationRule[] = [
  {
    targetState: VacancyEstado.Hunting,
    validator: (vacancy: VacancyWithRelations) => {
      //Revisar si el checklist esta validado
      if (!vacancy.IsChecklistValidated) {
        return {
          isValid: false,
          message: "No se puede cambiar al estado 'Hunting'",
          reason:
            "La vacante debe tener el checklist validado para poder pasar al estado 'Hunting'. Por favor, complete y valide el checklist primero.",
        };
      }
      //Revisar si el perfil muestra esta validado
      if (!vacancy.IsPerfilMuestraValidated) {
        return {
          isValid: false,
          message: "No se puede cambiar al estado 'Hunting'",
          reason:
            "La vacante debe tener el perfil muestra validado para poder pasar al estado 'Hunting'. Por favor, suba y valide el perfil muestra primero.",
        };
      }
      //Revisar si existe un job description
      if (!vacancy.jobDescriptionId) {
        return {
          isValid: false,
          message: "No se puede cambiar al estado 'Hunting'",
          reason:
            "La vacante debe tener un job description para poder pasar al estado 'Hunting'. Por favor, suba un job description.",
        };
      }

      return { isValid: true };
    },
    description: "Requiere checklist validado",
  },
  {
    targetState: VacancyEstado.Entrevistas,
    validator: (vacancy: VacancyWithRelations) => {
      // Para pasar a Entrevistas, debe tener al menos un candidato en terna final
      const hasCandidateValidated = vacancy.ternaFinal.some(
        (candidate) => candidate.IsCandidateValidated === true
      );
      if (!hasCandidateValidated) {
        return {
          isValid: false,
          message: "No se puede cambiar al estado 'Entrevistas'",
          reason:
            "Para pasar al estado 'Entrevistas' debe tener al menos un candidato validado. Por favor, valide un candidato antes de pasar al estado 'Entrevistas'.",
        };
      }
      return { isValid: true };
    },
    description: "Requiere al menos un candidato Autorizado",
  },
  {
    targetState: VacancyEstado.PrePlacement,
    validator: (vacancy: VacancyWithRelations) => {
      // Para pasar a PrePlacement, debe tener candidato contratado
      if (!vacancy.candidatoContratado) {
        return {
          isValid: false,
          message: "No se puede cambiar al estado 'Pre-Placement'",
          reason:
            "Para pasar al estado 'Pre-Placement' debe tener un candidato seleccionado. Por favor, complete el proceso de entrevistas y seleccione el candidato que fue contratado.",
        };
      }
      return { isValid: true };
    },
    description: "Requiere candidato contratado seleccionado",
  },
  {
    targetState: VacancyEstado.Placement,
    validator: (vacancy: VacancyWithRelations) => {
      // Para pasar a Placement, debe tener un candidato contratado
      if (!vacancy.candidatoContratado) {
        return {
          isValid: false,
          message: "No se puede cambiar al estado 'Placement'",
          reason:
            "Para completar el 'Placement' debe seleccionar un candidato contratado. Por favor, seleccione el candidato que fue contratado.",
        };
      }
      return { isValid: true };
    },
    description: "Requiere candidato contratado seleccionado",
  },
];

// Estados que no requieren validación especial (pueden cambiar libremente)
const freeTransitionStates: VacancyEstado[] = [
  VacancyEstado.QuickMeeting,
  VacancyEstado.Cancelada,
  VacancyEstado.Perdida,
];

/**
 * Valida si una vacante puede cambiar al estado especificado
 * @param vacancy - La vacante que se quiere cambiar de estado
 * @param targetState - El estado al que se quiere cambiar
 * @returns ValidationResult con el resultado de la validación
 */
export function validateStateTransition(
  vacancy: VacancyWithRelations,
  targetState: VacancyEstado
): ValidationResult {
  // Si el estado actual es igual al estado objetivo, no hacer nada
  if (vacancy.estado === targetState) {
    return {
      isValid: false,
      message: "Sin cambios",
      reason: "La vacante ya se encuentra en el estado solicitado.",
    };
  }

  // Si es un estado que permite transición libre, permitir el cambio
  if (freeTransitionStates.includes(targetState)) {
    return { isValid: true };
  }

  // Buscar la regla de validación para el estado objetivo
  const rule = stateValidationRules.find(
    (rule) => rule.targetState === targetState
  );

  // Si no hay regla específica, permitir el cambio
  if (!rule) {
    return { isValid: true };
  }

  // Ejecutar la validación específica
  return rule.validator(vacancy);
}

/**
 * Obtiene todas las reglas de validación disponibles
 * @returns Array de reglas de validación
 */
export function getValidationRules(): StateValidationRule[] {
  return stateValidationRules;
}

/**
 * Obtiene la descripción de validación para un estado específico
 * @param state - El estado del cual obtener la descripción
 * @returns String con la descripción o undefined si no hay regla
 */
export function getStateValidationDescription(
  state: VacancyEstado
): string | undefined {
  const rule = stateValidationRules.find((rule) => rule.targetState === state);
  return rule?.description;
}

/**
 * Verifica si un estado requiere validación especial
 * @param state - El estado a verificar
 * @returns boolean indicando si requiere validación
 */
export function requiresValidation(state: VacancyEstado): boolean {
  return (
    stateValidationRules.some((rule) => rule.targetState === state) &&
    !freeTransitionStates.includes(state)
  );
}
