import { NextResponse } from "next/server";
import prisma from "@/core/lib/db";
import { LeadStatus } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parámetros de paginación
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const skip = (page - 1) * pageSize;

    // Parámetros de filtrado
    const status = searchParams.get("status");
    const generadorId = searchParams.get("generadorId");
    const origenId = searchParams.get("origenId");
    const search = searchParams.get("search");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    // Parámetros de ordenamiento
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Construir filtros dinámicamente
    const where: any = {};

    if (status && status !== "all") {
      where.status = status as LeadStatus;
    }

    if (generadorId && generadorId !== "all") {
      where.generadorId = generadorId;
    }

    if (origenId && origenId !== "all") {
      where.origenId = origenId;
    }

    if (search) {
      where.OR = [
        { empresa: { contains: search, mode: "insensitive" } },
        { origen: { nombre: { contains: search, mode: "insensitive" } } },
        { sector: { nombre: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (dateFrom && dateTo) {
      where.createdAt = {
        gte: new Date(dateFrom),
        lte: new Date(dateTo),
      };
    } else if (dateFrom) {
      where.createdAt = { gte: new Date(dateFrom) };
    } else if (dateTo) {
      where.createdAt = { lte: new Date(dateTo) };
    }

    // Ejecutar consultas en paralelo para mejor rendimiento
    const [leads, totalCount] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          generadorLeads: true,
          origen: true,
          sector: true,
          contactos: {
            include: {
              interactions: {
                include: {
                  autor: true,
                  contacto: true,
                },
              },
            },
          },
          statusHistory: {
            include: {
              changedBy: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: pageSize,
      }),
      prisma.lead.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return NextResponse.json({
      data: leads,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error al obtener los leads:", error);
    return NextResponse.json(
      { error: "Error al obtener los leads" },
      { status: 500 }
    );
  }
}
