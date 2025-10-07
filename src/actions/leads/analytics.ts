import prisma from "@/core/lib/db";
import { LeadStatus } from "@prisma/client";

// Función para obtener el estado de los leads en un rango de fechas
async function getLeadsStatusInDateRange(startDate: Date, endDate: Date) {
  // Obtenemos todos los leads que existían antes o durante el periodo
  const existingLeads = await prisma.lead.findMany({
    where: {
      createdAt: {
        lte: endDate, // leads creados antes o hasta la fecha final
      },
    },
    select: {
      id: true,
      empresa: true,
      createdAt: true,
    },
  });

  const leadStatusesInRange = [];

  // Para cada lead, buscar su estado en el rango de fechas
  for (const lead of existingLeads) {
    // Buscamos todos los cambios de estado dentro del rango
    const statusChangesInRange = await prisma.leadStatusHistory.findMany({
      where: {
        leadId: lead.id,
        changedAt: {
          gte: startDate, // cambios a partir de la fecha inicial
          lte: endDate, // cambios hasta la fecha final
        },
      },
      orderBy: {
        changedAt: "asc", // ordenados por fecha ascendente
      },
    });

    // Si el lead no tuvo cambios dentro del rango, necesitamos encontrar su estado previo
    if (statusChangesInRange.length === 0) {
      // Buscar el último cambio antes del rango
      const statusBeforeRange = await prisma.leadStatusHistory.findFirst({
        where: {
          leadId: lead.id,
          changedAt: {
            lt: startDate, // cambios realizados antes de la fecha inicial
          },
        },
        orderBy: {
          changedAt: "desc", // el cambio más reciente primero
        },
        select: {
          status: true,
        },
      });

      // Si encontramos un estado previo o el lead existía antes del rango
      if (statusBeforeRange || lead.createdAt < startDate) {
        leadStatusesInRange.push({
          leadId: lead.id,
          empresa: lead.empresa,
          // Si hay un estado previo, usamos ese; de lo contrario, usamos el estado inicial
          status: statusBeforeRange ? statusBeforeRange.status : "Contacto",
          // Marcamos la fecha como la fecha inicial del rango
          statusDate: startDate,
          // Indicamos que este es un estado que ya existía al inicio del rango
          type: "initialState",
        });
      }
      // Si el lead fue creado durante el rango pero no tuvo cambios
      else if (lead.createdAt >= startDate && lead.createdAt <= endDate) {
        leadStatusesInRange.push({
          leadId: lead.id,
          empresa: lead.empresa,
          status: LeadStatus.Contacto, // Estado por defecto al crear un lead
          statusDate: lead.createdAt,
          type: "created",
        });
      }
    }
    // Si hubo cambios dentro del rango, los añadimos todos
    else {
      // Primero, si el lead existía antes del rango, añadimos su estado inicial
      if (lead.createdAt < startDate) {
        const statusBeforeRange = await prisma.leadStatusHistory.findFirst({
          where: {
            leadId: lead.id,
            changedAt: {
              lt: startDate,
            },
          },
          orderBy: {
            changedAt: "desc",
          },
        });

        if (statusBeforeRange) {
          leadStatusesInRange.push({
            leadId: lead.id,
            empresa: lead.empresa,
            status: statusBeforeRange.status,
            statusDate: startDate,
            type: "initialState",
          });
        }
      }

      // Luego añadimos todos los cambios dentro del rango
      statusChangesInRange.forEach((change) => {
        leadStatusesInRange.push({
          leadId: lead.id,
          empresa: lead.empresa,
          status: change.status,
          statusDate: change.changedAt,
          type: "statusChange",
        });
      });
    }
  }

  return leadStatusesInRange;
}
