import { NextRequest, NextResponse } from "next/server";
import prisma from "@/core/lib/db";

export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      where: {
        State: "ACTIVO",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Error al obtener usuarios" },
      { status: 500 }
    );
  }
}
