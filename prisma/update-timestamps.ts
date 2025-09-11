import { PrismaClient, VacancyEstado } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Script para migrar vacantes existentes y establecer fechaPausaConteo
 * para aquellas que ya están en estados que requieren pausar el conteo
 */
async function migrateVacancyPauseTimestamps() {
  try {
    console.log("🚀 Iniciando migración de fechaPausaConteo...");

    // Estados que requieren pausar el conteo
    const estadosQuePausanConteo: VacancyEstado[] = [
      VacancyEstado.StandBy,
      VacancyEstado.Cancelada,
      VacancyEstado.Perdida,
    ];

    // Encontrar todas las vacantes que están en estados que requieren pausa
    const vacantesEnEstadosPausados = await prisma.vacancy.findMany({
      where: {
        estado: {
          in: estadosQuePausanConteo,
        },
        fechaPausaConteo: null, // Solo las que no tienen fecha de pausa establecida
      },
      include: {
        statusHistory: {
          orderBy: {
            changedAt: "desc",
          },
          take: 1,
          where: {
            status: {
              in: estadosQuePausanConteo,
            },
          },
        },
      },
    });

    console.log(
      `📊 Encontradas ${vacantesEnEstadosPausados.length} vacantes en estados pausados sin fechaPausaConteo`
    );

    let vacantesActualizadas = 0;

    for (const vacante of vacantesEnEstadosPausados) {
      try {
        // Buscar el historial de cambio de estado más reciente para este estado
        const ultimoCambioEstado = await prisma.vacancyStatusHistory.findFirst({
          where: {
            vacancyId: vacante.id,
            status: vacante.estado,
          },
          orderBy: {
            changedAt: "desc",
          },
        });

        // Usar la fecha del último cambio de estado o la fecha de creación como fallback
        const fechaPausa =
          ultimoCambioEstado?.changedAt || vacante.createdAt || new Date();

        await prisma.vacancy.update({
          where: {
            id: vacante.id,
          },
          data: {
            fechaPausaConteo: fechaPausa,
          },
        });

        vacantesActualizadas++;
        console.log(
          `✅ Vacante ${vacante.posicion} (${vacante.id}) - Estado: ${
            vacante.estado
          } - Fecha pausa: ${fechaPausa.toISOString()}`
        );
      } catch (error) {
        console.error(`❌ Error al actualizar vacante ${vacante.id}: ${error}`);
      }
    }

    console.log(
      `🎉 Migración completada. ${vacantesActualizadas} vacantes actualizadas.`
    );

    // Mostrar estadísticas finales
    const estadisticasFinales = await prisma.vacancy.groupBy({
      by: ["estado"],
      _count: {
        id: true,
      },
      where: {
        fechaPausaConteo: {
          not: null,
        },
      },
    });

    console.log("\n📈 Estadísticas finales de vacantes con fechaPausaConteo:");
    estadisticasFinales.forEach((stat) => {
      console.log(`   ${stat.estado}: ${stat._count.id} vacantes`);
    });
  } catch (error) {
    console.error("💥 Error durante la migración:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  migrateVacancyPauseTimestamps();
}

export { migrateVacancyPauseTimestamps };
