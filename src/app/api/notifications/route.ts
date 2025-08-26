import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { NotificationStatus, NotificationType } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status") as NotificationStatus | null;
    const type = searchParams.get("type") as NotificationType | null;
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!userId) {
      return new NextResponse("ID de usuario requerido", { status: 400 });
    }

    // Construir filtros
    const whereClause: any = {
      recipientId: userId,
    };

    if (status) {
      whereClause.status = status;
    }

    if (type) {
      whereClause.type = type;
    }

    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) {
        whereClause.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        whereClause.createdAt.lte = new Date(dateTo);
      }
    }

    if (search) {
      whereClause.message = {
        contains: search,
        mode: "insensitive",
      };
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        vacancy: {
          include: {
            cliente: true,
            reclutador: true,
          },
        },
        task: {
          include: {
            assignedTo: true,
            notificationRecipients: true,
          },
        },
      },
      take: limit,
    });

    // Obtener estadísticas si se solicitan
    const includeStats = searchParams.get("includeStats") === "true";
    let stats = null;

    if (includeStats) {
      const [total, unread, read] = await Promise.all([
        prisma.notification.count({
          where: { recipientId: userId },
        }),
        prisma.notification.count({
          where: {
            recipientId: userId,
            status: NotificationStatus.UNREAD,
          },
        }),
        prisma.notification.count({
          where: {
            recipientId: userId,
            status: NotificationStatus.READ,
          },
        }),
      ]);

      stats = { total, unread, read };
    }

    return NextResponse.json({
      notifications,
      stats,
      filters: {
        status,
        type,
        dateFrom,
        dateTo,
        search,
      },
    });
  } catch (error) {
    console.error("[NOTIFICATIONS_GET]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}
