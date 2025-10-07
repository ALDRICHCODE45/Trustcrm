import { auth } from "@/core/lib/auth";
import prisma from "@/core/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ notificationId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    // Await params since it's now a Promise
    const { notificationId } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return new NextResponse("Estado requerido", { status: 400 });
    }

    const notification = await prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        status,
      },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error("[NOTIFICATION_PATCH]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}
