# Sistema de Validación de Estados de Vacantes

Este documento describe el sistema de validación implementado para controlar las transiciones de estado en el kanban board de vacantes.

## Descripción General

El sistema implementa un middleware de validación que se ejecuta cada vez que se intenta cambiar el estado de una vacante en el kanban board. Esto asegura que las vacantes solo puedan avanzar a estados específicos cuando cumplan con ciertos requisitos.

## Archivos Principales

### 1. `src/lib/vacancyStateValidations.ts`

Contiene toda la lógica de validación:

- **`validateStateTransition()`**: Función principal que valida si una transición es válida
- **`getValidationRules()`**: Obtiene todas las reglas de validación
- **`requiresValidation()`**: Verifica si un estado requiere validación especial

### 2. `src/actions/vacantes/actions.ts`

- **`updateVacancyStatus()`**: Función modificada que ahora incluye validaciones antes de actualizar el estado

### 3. `src/components/ui/ValidationErrorToast.tsx`

- Componente de toast especializado para mostrar errores de validación con información detallada

### 4. `src/hooks/useVacancyValidation.ts`

- Hook personalizado que facilita el uso de las validaciones en componentes React

### 5. `src/components/ui/VacancyValidationIndicators.tsx`

- Componente visual que muestra indicadores del estado de validación en las tarjetas

## Reglas de Validación Implementadas

### Estado: Hunting

- **Requisito**: `IsChecklistValidated = true`
- **Mensaje**: "La vacante debe tener el checklist validado para poder pasar al estado 'Hunting'"

### Estado: Entrevistas

- **Requisito**: Al menos un candidato en `ternaFinal`
- **Mensaje**: "Para pasar al estado 'Entrevistas' debe tener al menos un candidato en la terna final"

### Estado: PrePlacement

- **Requisito**: Candidatos en `ternaFinal`
- **Mensaje**: "Para pasar al estado 'Pre-Placement' debe tener candidatos en la terna final"

### Estado: Placement

- **Requisito**: `candidatoContratado` debe estar definido
- **Mensaje**: "Para completar el 'Placement' debe seleccionar un candidato contratado"

### Estados sin validación

Los siguientes estados permiten transición libre:

- `QuickMeeting`
- `Cancelada`
- `Perdida`

## Uso del Sistema

### En el Kanban Board

El sistema se activa automáticamente cuando se arrastra una tarjeta de vacante a una nueva columna. Si la validación falla:

1. **Se muestra un toast de error** con:
   - Título descriptivo
   - Mensaje principal
   - Razón detallada del fallo
2. **La vacante permanece en su estado original**

3. **Se registra el error** en la consola para debugging

### Usando el Hook personalizado

```typescript
import { useVacancyValidation } from "@/hooks/useVacancyValidation";

function MyComponent({ vacancy }) {
  const { validateTransition, getAvailableStates, getBlockedStates } =
    useVacancyValidation();

  // Validar una transición específica
  const result = validateTransition(vacancy, VacancyEstado.Hunting);

  // Obtener estados disponibles
  const availableStates = getAvailableStates(vacancy);

  // Obtener estados bloqueados con razones
  const blockedStates = getBlockedStates(vacancy);
}
```

### Uso directo de las validaciones

```typescript
import { validateStateTransition } from "@/lib/vacancyStateValidations";

const result = validateStateTransition(vacancy, targetState);
if (!result.isValid) {
  console.log(result.message); // Mensaje principal
  console.log(result.reason); // Razón detallada
}
```

## Extensión del Sistema

### Agregar nuevas validaciones

Para agregar una nueva regla de validación, edita el array `stateValidationRules` en `vacancyStateValidations.ts`:

```typescript
{
  targetState: VacancyEstado.NuevoEstado,
  validator: (vacancy: VacancyWithRelations) => {
    if (!vacancy.algunaCondicion) {
      return {
        isValid: false,
        message: "Mensaje principal",
        reason: "Explicación detallada del por qué no se puede cambiar",
      };
    }
    return { isValid: true };
  },
  description: "Descripción corta del requisito",
}
```

### Modificar validaciones existentes

Simplemente edita la función `validator` de la regla correspondiente en el mismo archivo.

## Consideraciones Técnicas

1. **Performance**: Las validaciones se ejecutan en el servidor, por lo que hay un pequeño delay en la respuesta
2. **Consistencia**: Todas las validaciones usan la misma estructura de datos `VacancyWithRelations`
3. **Extensibilidad**: El sistema está diseñado para ser fácilmente extensible
4. **Manejo de errores**: Se incluye manejo robusto de errores tanto en cliente como servidor

## Testing

Para probar el sistema:

1. **Crear una vacante** sin checklist validado
2. **Intentar moverla a "Hunting"** → Debe mostrar error
3. **Validar el checklist** de la vacante
4. **Intentar nuevamente** → Debe permitir el movimiento
5. **Repetir con otros estados** y sus respectivos requisitos

## Feedback Visual

El sistema incluye indicadores visuales opcionales que se pueden agregar a las tarjetas de vacantes para mostrar el estado de las validaciones:

```typescript
import { VacancyValidationIndicators } from "@/components/ui/VacancyValidationIndicators";

<VacancyValidationIndicators vacancy={vacancy} size="sm" />;
```

Estos indicadores muestran:

- ✅ Checklist validado
- ⚠️ Checklist pendiente
- 👥 Candidatos en terna final
- 👤 Candidato contratado
