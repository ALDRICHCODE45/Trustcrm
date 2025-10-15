import { NextRequest, NextResponse } from "next/server";
import { checkEntryDates } from "@/scripts/check-entry-dates";

/**
 * API Route para verificar fechas de ingreso de candidatos
 * Puede ser llamado por cron jobs externos o webhooks
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar token de seguridad opcional
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.CRON_SECRET_TOKEN;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: "Token de autorización inválido" },
        { status: 401 }
      );
    }

    console.log("🔄 API: Iniciando verificación de fechas de ingreso...");

    // Ejecutar la verificación
    const result = await checkEntryDates();

    if (result.ok) {
      return NextResponse.json({
        success: true,
        message: result.message,
        data: {
          vacanciesFound: result.vacanciesFound,
          notificationsCreated: result.notificationsCreated,
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          error: result.error,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("💥 Error en API de verificación:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint para verificación manual o testing
 */
export async function GET() {
  try {
    console.log("🔄 API GET: Verificación manual de fechas de ingreso...");

    const result = await checkEntryDates();

    return NextResponse.json({
      success: result.ok,
      message: result.message,
      data: result.ok
        ? {
            vacanciesFound: result.vacanciesFound,
            notificationsCreated: result.notificationsCreated,
          }
        : null,
      error: result.ok ? null : result.error,
    });
  } catch (error) {
    console.error("💥 Error en API GET de verificación:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
