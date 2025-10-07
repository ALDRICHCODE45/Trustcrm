import prisma from "@/core/lib/db";

export async function GET(request: Request) {
  try {
    // Para App Router
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Para Pages Router
    // const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return new Response(JSON.stringify({ error: "Fechas requeridas" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const history = await getLeadsStatusInDateRange(
      new Date(startDate),
      new Date(endDate),
    );

    return new Response(JSON.stringify(history), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error en API de historial:", error);
    return new Response(
      JSON.stringify({ error: "Error al obtener historial" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

// Función simplificada para obtener historial de leads
async function getLeadsStatusInDateRange(startDate: Date, endDate: Date) {
  // Obtener todos los cambios de estado en el rango de fechas
  const statusChanges = await prisma.leadStatusHistory.findMany({
    where: {
      changedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      lead: {
        select: {
          id: true,
          empresa: true,
          generadorLeads: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      changedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      changedAt: "asc",
    },
  });

  // Mapear los resultados al formato esperado
  return statusChanges.map((change) => ({
    leadId: change.leadId,
    empresa: change.lead.empresa,
    status: change.status,
    statusDate: change.changedAt.toISOString(),
    type: "statusChange",
    generador: change.changedBy, // Usar directamente la persona que hizo el cambio
  }));
}
