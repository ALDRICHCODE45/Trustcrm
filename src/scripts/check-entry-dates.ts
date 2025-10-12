"use server";

import {
  PrismaClient,
  SpecialNotificationType,
  SpecialNotificationPriority,
} from "@prisma/client";
import { startOfDay, endOfDay } from "date-fns";

const prisma = new PrismaClient();

/**
 * Script para verificar diariamente las fechas de ingreso de candidatos
 * y crear notificaciones especiales para los reclutadores
 */
export async function checkEntryDates() {
  try {
    console.log("🔍 Verificando fechas de ingreso para hoy...");

    const today = new Date();
    const startToday = startOfDay(today);
    const endToday = endOfDay(today);

    // Buscar vacantes en PrePlacement con fecha de ingreso hoy
    const vacanciesWithEntryToday = await prisma.vacancy.findMany({
      where: {
        estado: "PrePlacement",
        fecha_proxima_entrada: {
          gte: startToday,
          lte: endToday,
        },
      },
      include: {
        candidatoContratado: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        cliente: {
          select: {
            id: true,
            cuenta: true,
          },
        },
        reclutador: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    console.log(
      `📊 Encontradas ${vacanciesWithEntryToday.length} vacantes con ingreso hoy`
    );

    let notificationsCreated = 0;

    for (const vacancy of vacanciesWithEntryToday) {
      try {
        // Verificar si ya existe una notificación para esta vacante hoy
        const existingNotification = await prisma.specialNotification.findFirst(
          {
            where: {
              type: SpecialNotificationType.CANDIDATE_ENTRY_REMINDER,
              vacancyId: vacancy.id,
              recipientId: vacancy.reclutadorId,
              createdAt: {
                gte: startToday,
                lte: endToday,
              },
            },
          }
        );

        if (existingNotification) {
          console.log(
            `⏭️  Ya existe notificación para vacante ${vacancy.posicion} - Omitiendo`
          );
          continue;
        }

        // Crear el mensaje personalizado
        const candidateName =
          vacancy.candidatoContratado?.name || "el candidato";
        const clientName = vacancy.cliente?.cuenta || "la empresa";
        const position = vacancy.posicion;

        const title = "🎉 ¡Candidato ingresa hoy!";
        const message = `El candidato ${candidateName} ingresa hoy a ${clientName} en la posición de ${position}. Es momento de mover la vacante a Placement y enviar un mensaje de buena suerte al candidato.`;

        // Crear la notificación especial
        await prisma.specialNotification.create({
          data: {
            type: SpecialNotificationType.CANDIDATE_ENTRY_REMINDER,
            title,
            message,
            priority: SpecialNotificationPriority.HIGH,
            recipientId: vacancy.reclutadorId,
            vacancyId: vacancy.id,
          },
        });

        notificationsCreated++;
        console.log(
          `✅ Notificación creada para ${vacancy.reclutador.name} - Vacante: ${position}`
        );
      } catch (error) {
        console.error(
          `❌ Error creando notificación para vacante ${vacancy.id}:`,
          error
        );
      }
    }

    console.log(
      `🎯 Proceso completado: ${notificationsCreated} notificaciones creadas`
    );

    return {
      ok: true,
      message: `Verificación completada: ${notificationsCreated} notificaciones creadas`,
      vacanciesFound: vacanciesWithEntryToday.length,
      notificationsCreated,
    };
  } catch (error) {
    console.error(
      "💥 Error durante la verificación de fechas de ingreso:",
      error
    );
    return {
      ok: false,
      message: "Error durante la verificación de fechas de ingreso",
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Script ejecutable desde línea de comandos
 */
async function main() {
  console.log("🚀 Iniciando verificación de fechas de ingreso...");
  const result = await checkEntryDates();

  if (result.ok) {
    console.log("✨ Verificación completada exitosamente");
  } else {
    console.error("💥 Error en la verificación:", result.message);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main()
    .then(() => {
      console.log("🏁 Script finalizado");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Error fatal:", error);
      process.exit(1);
    });
}
