# Sistema de Notificaciones Especiales

## Descripción General

El sistema de notificaciones especiales está diseñado para manejar eventos importantes que requieren atención inmediata del usuario, como la asignación de nuevas vacantes. A diferencia del sistema de notificaciones regular, estas notificaciones se muestran como diálogos prominentes en el centro de la pantalla.

## Características Principales

- **Diálogos prominentes**: Se muestran automáticamente en el centro de la pantalla
- **Información detallada**: Incluyen metadata específica del evento
- **Sistema de prioridades**: URGENT, HIGH, MEDIUM, LOW
- **Expiración automática**: Las notificaciones pueden configurarse para expirar
- **Polling automático**: Verifica nuevas notificaciones cada 30 segundos
- **Estados de seguimiento**: PENDING, SHOWN, DISMISSED

## Estructura de la Base de Datos

### Modelo SpecialNotification

```prisma
model SpecialNotification {
  id          String                     @id @default(cuid())
  type        SpecialNotificationType
  status      SpecialNotificationStatus  @default(PENDING)
  priority    SpecialNotificationPriority @default(MEDIUM)
  title       String
  message     String
  metadata    Json? // Datos adicionales específicos del evento

  // Relaciones
  recipient   User    @relation(fields: [recipientId], references: [id])
  recipientId String
  vacancy     Vacancy? @relation(fields: [vacancyId], references: [id])
  vacancyId   String?
  task        Task?    @relation(fields: [taskId], references: [id])
  taskId      String?
  client      Client?  @relation(fields: [clientId], references: [id])
  clientId    String?

  // Configuración
  expiresAt   DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Enums

- **SpecialNotificationType**: VACANCY_ASSIGNED, VACANCY_STATUS_CHANGED, CLIENT_ASSIGNED, URGENT_TASK_ASSIGNED
- **SpecialNotificationStatus**: PENDING, SHOWN, DISMISSED
- **SpecialNotificationPriority**: LOW, MEDIUM, HIGH, URGENT

## Flujo de Uso

### 1. Creación de Vacante con Notificación

```typescript
// En el formulario de crear vacante
const result = await createVacancy(vacancyData);

if (result.ok && data.enviarNotificacion && data.reclutadorId) {
  await createVacancyAssignedNotification(
    result.vacancy.id,
    data.reclutadorId,
    user_logged.id,
    true
  );
}
```

### 2. Detección y Mostrado de Notificaciones

El `SpecialNotificationProvider` se encarga de:

- Hacer polling cada 30 segundos
- Mostrar automáticamente diálogos para notificaciones PENDING
- Manejar la cola de notificaciones múltiples

### 3. Interacción del Usuario

El usuario puede:

- **Entendido**: Marca la notificación como SHOWN
- **Descartar**: Marca la notificación como DISMISSED

## Archivos del Sistema

### Backend

- `src/actions/notifications/special-notifications.ts` - Acciones del servidor
- `src/app/api/special-notifications/route.ts` - API endpoints

### Frontend

- `src/hooks/useSpecialNotifications.ts` - Hook personalizado
- `src/components/notifications/SpecialNotificationDialog.tsx` - Componente del diálogo
- `src/components/notifications/SpecialNotificationProvider.tsx` - Provider global

### Base de Datos

- `prisma/schema.prisma` - Modelo y relaciones
- `prisma/migrations/add_special_notifications.sql` - Migración manual

## Configuración

### 1. Ejecutar la migración

```bash
# Aplicar la migración manual
psql -d your_database < prisma/migrations/add_special_notifications.sql

# O usar Prisma
npx prisma db push
npx prisma generate
```

### 2. El provider ya está integrado en el layout principal

## Uso en Otros Módulos

### Crear notificación personalizada

```typescript
import { createSpecialNotification } from "@/actions/notifications/special-notifications";

await createSpecialNotification({
  type: "URGENT_TASK_ASSIGNED",
  title: "Tarea Urgente Asignada",
  message: "Se te ha asignado una tarea con alta prioridad",
  recipientId: userId,
  priority: "URGENT",
  metadata: { taskDetails: "..." },
  taskId: taskId,
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
});
```

### Tipos de notificaciones disponibles

1. **VACANCY_ASSIGNED**: Asignación de nueva vacante
2. **VACANCY_STATUS_CHANGED**: Cambio de estado de vacante
3. **CLIENT_ASSIGNED**: Asignación de nuevo cliente
4. **URGENT_TASK_ASSIGNED**: Asignación de tarea urgente

## Mantenimiento

### Limpieza automática

Las notificaciones expiradas se pueden limpiar usando:

```typescript
await cleanupExpiredSpecialNotifications();
```

### Monitoreo

- Las notificaciones se indexan por recipiente, tipo y prioridad
- Se puede hacer seguimiento del estado de las notificaciones
- Los metadatos permiten análisis detallado

## Extensibilidad

El sistema está diseñado para ser fácilmente extensible:

- Agregar nuevos tipos en el enum `SpecialNotificationType`
- Crear funciones específicas como `createVacancyAssignedNotification`
- Personalizar el contenido del diálogo según el tipo
- Agregar nuevos campos de metadata según sea necesario
