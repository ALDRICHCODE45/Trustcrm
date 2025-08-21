import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import {
  getPendingSpecialNotifications,
  markSpecialNotificationAsShown,
  dismissSpecialNotification,
} from "@/actions/notifications/special-notifications";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return new NextResponse("ID de usuario requerido", { status: 400 });
    }

    const result = await getPendingSpecialNotifications(userId);

    if (!result.ok) {
      return new NextResponse(result.message, { status: 500 });
    }

    return NextResponse.json({
      notifications: result.notifications,
    });
  } catch (error) {
    console.error("[SPECIAL_NOTIFICATIONS_GET]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    const body = await request.json();
    const { notificationId, action } = body;

    if (!notificationId || !action) {
      return new NextResponse("Datos requeridos faltantes", { status: 400 });
    }

    let result;
    if (action === "shown") {
      result = await markSpecialNotificationAsShown(notificationId);
    } else if (action === "dismiss") {
      result = await dismissSpecialNotification(notificationId);
    } else {
      return new NextResponse("Acción no válida", { status: 400 });
    }

    if (!result.ok) {
      return new NextResponse(result.message, { status: 500 });
    }

    return NextResponse.json({ message: result.message });
  } catch (error) {
    console.error("[SPECIAL_NOTIFICATIONS_PATCH]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}
