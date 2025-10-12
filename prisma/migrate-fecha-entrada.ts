import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Script para migrar el campo fecha_proxima_entrada de String a DateTime
 * ADVERTENCIA: Este script eliminará todos los datos existentes en el campo fecha_proxima_entrada
 */
async function migrateFechaProximaEntrada() {
  try {
    console.log("🚀 Iniciando migración de fecha_proxima_entrada...");

    // Paso 1: Contar cuántas vacantes tienen fecha_proxima_entrada con datos
    const vacantesConFecha = await prisma.vacancy.count({
      where: {
        fecha_proxima_entrada: {
          not: null,
        },
      },
    });

    console.log(
      `📊 Encontradas ${vacantesConFecha} vacantes con fecha_proxima_entrada`
    );

    if (vacantesConFecha > 0) {
      console.log(
        "⚠️  ADVERTENCIA: Se perderán todos los datos existentes en fecha_proxima_entrada"
      );
      console.log("📝 Limpiando datos existentes...");

      // Paso 2: Limpiar todos los datos existentes
      const result = await prisma.vacancy.updateMany({
        where: {
          fecha_proxima_entrada: {
            not: null,
          },
        },
        data: {
          fecha_proxima_entrada: null,
        },
      });

      console.log(`✅ Se limpiaron ${result.count} registros`);
    }

    console.log("🎉 Migración completada exitosamente");
    console.log("💡 Ahora puedes ejecutar: npx prisma db push");
    console.log(
      "💡 O generar una migración: npx prisma migrate dev --name convert-fecha-entrada-to-datetime"
    );
  } catch (error) {
    console.error("❌ Error durante la migración:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la migración
if (require.main === module) {
  migrateFechaProximaEntrada()
    .then(() => {
      console.log("✨ Script completado");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Error fatal:", error);
      process.exit(1);
    });
}

export { migrateFechaProximaEntrada };
