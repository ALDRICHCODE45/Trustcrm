import { PrismaClient, VacancyEstado } from "@prisma/client";
import { checkEntryDates } from "./check-entry-dates";

const prisma = new PrismaClient();

/**
 * Script de prueba para crear una vacante de prueba con fecha de ingreso hoy
 * y probar el sistema de notificaciones
 */
async function testEntryNotificationSystem() {
  try {
    console.log("🧪 Iniciando prueba del sistema de notificaciones...");

    // Paso 1: Buscar o crear datos de prueba
    console.log("📋 Buscando datos para la prueba...");

    // Buscar un reclutador
    const reclutador = await prisma.user.findFirst({
      where: { role: "reclutador" },
    });

    if (!reclutador) {
      console.log("❌ No se encontró un reclutador para la prueba");
      return;
    }

    // Buscar un cliente
    const cliente = await prisma.client.findFirst();

    if (!cliente) {
      console.log("❌ No se encontró un cliente para la prueba");
      return;
    }

    // Buscar un candidato (Person)
    const candidato = await prisma.person.findFirst();

    if (!candidato) {
      console.log("❌ No se encontró un candidato para la prueba");
      return;
    }

    console.log(`✅ Datos encontrados:`);
    console.log(`   - Reclutador: ${reclutador.name}`);
    console.log(`   - Cliente: ${cliente.cuenta || "Sin nombre"}`);
    console.log(`   - Candidato: ${candidato.name}`);

    // Paso 2: Crear una vacante de prueba
    console.log("🏗️  Creando vacante de prueba...");

    const today = new Date();
    const testVacancy = await prisma.vacancy.create({
      data: {
        fechaAsignacion: new Date(),
        reclutadorId: reclutador.id,
        tipo: "Nueva",
        estado: VacancyEstado.PrePlacement,
        posicion: "Desarrollador Full Stack (PRUEBA)",
        prioridad: "Alta",
        clienteId: cliente.id,
        candidatoContratadoId: candidato.id,
        salarioFinal: "50000 brutos",
        fecha_proxima_entrada: today, // ¡Fecha de hoy!
      },
    });

    console.log(`✅ Vacante de prueba creada: ${testVacancy.posicion}`);
    console.log(`   - ID: ${testVacancy.id}`);
    console.log(`   - Fecha de ingreso: ${testVacancy.fecha_proxima_entrada}`);

    // Paso 3: Ejecutar el sistema de verificación
    console.log("🔍 Ejecutando verificación de fechas...");

    const result = await checkEntryDates();

    if (result.ok) {
      console.log(`✅ Verificación exitosa:`);
      console.log(`   - Vacantes encontradas: ${result.vacanciesFound}`);
      console.log(
        `   - Notificaciones creadas: ${result.notificationsCreated}`
      );
    } else {
      console.log(`❌ Error en verificación: ${result.message}`);
    }

    // Paso 4: Verificar que se creó la notificación
    console.log("🔍 Verificando notificación creada...");

    const notification = await prisma.specialNotification.findFirst({
      where: {
        type: "CANDIDATE_ENTRY_REMINDER",
        vacancyId: testVacancy.id,
      },
      include: {
        recipient: true,
        vacancy: {
          include: {
            candidatoContratado: true,
            cliente: true,
          },
        },
      },
    });

    if (notification) {
      console.log(`✅ Notificación creada exitosamente:`);
      console.log(`   - Título: ${notification.title}`);
      console.log(`   - Mensaje: ${notification.message}`);
      console.log(`   - Destinatario: ${notification.recipient.name}`);
      console.log(`   - Prioridad: ${notification.priority}`);
    } else {
      console.log(`❌ No se encontró la notificación esperada`);
    }

    // Paso 5: Limpiar datos de prueba
    // console.log("🧹 Limpiando datos de prueba...");

    // if (notification) {
    //   await prisma.specialNotification.delete({
    //     where: { id: notification.id },
    //   });
    //   console.log("✅ Notificación de prueba eliminada");
    // }

    // await prisma.vacancy.delete({
    //   where: { id: testVacancy.id },
    // });
    // console.log("✅ Vacante de prueba eliminada");

    // console.log("🎉 Prueba completada exitosamente!");
  } catch (error) {
    console.error("💥 Error durante la prueba:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la prueba
if (require.main === module) {
  testEntryNotificationSystem()
    .then(() => {
      console.log("✨ Script de prueba finalizado");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Error fatal en la prueba:", error);
      process.exit(1);
    });
}

export { testEntryNotificationSystem };
