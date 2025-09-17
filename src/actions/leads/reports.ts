"use server";

import prisma from "@/lib/db";
import { LeadStatus } from "@prisma/client";

export interface LeadDetail {
  id: string;
  empresa: string;
  createdAt: Date;
  currentStatus: string;
  statusInPeriod: string;
}

export interface LeadReportData {
  generadorId: string;
  generadorName: string;
  periodo: string;
  contactos: number;
  socialSelling: number;
  contactoCalido: number;
  citaAgendada: number;
  citaAtendida: number;
  citaValidada: number;
  asignadas: number;
  total: number;
  // Detalles de leads por estado
  contactosDetails: LeadDetail[];
  socialSellingDetails: LeadDetail[];
  contactoCalidoDetails: LeadDetail[];
  citaAgendadaDetails: LeadDetail[];
  citaAtendidaDetails: LeadDetail[];
  citaValidadaDetails: LeadDetail[];
  asignadasDetails: LeadDetail[];
}

export interface LeadReportFilters {
  generadorId?: string;
  fechaInicio: Date;
  fechaFin: Date;
}

export async function getLeadReports(
  filters: LeadReportFilters
): Promise<LeadReportData[]> {
  try {
    const { generadorId, fechaInicio, fechaFin } = filters;

    // Si se especifica un generador, obtener solo ese, sino todos
    const whereClause = generadorId ? { id: generadorId } : {};

    const generadores = await prisma.user.findMany({
      where: {
        ...whereClause,
        Lead: {
          some: {}, // Solo usuarios que tienen leads
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const reportData: LeadReportData[] = [];

    for (const generador of generadores) {
      // Obtener todos los leads del generador que existían antes o durante el período
      const leads = await prisma.lead.findMany({
        where: {
          generadorId: generador.id,
          createdAt: {
            lte: fechaFin, // Solo leads que existían al final del período
          },
        },
        include: {
          statusHistory: {
            orderBy: {
              changedAt: "asc", // Ordenar por fecha ascendente para seguir la cronología
            },
          },
        },
      });

      // Contar los estados en el período especificado
      const estadisticas = {
        contactos: 0,
        socialSelling: 0,
        contactoCalido: 0,
        citaAgendada: 0,
        citaAtendida: 0,
        citaValidada: 0,
        asignadas: 0,
      };

      // Arrays para almacenar los detalles de leads por estado
      const detallesPorEstado = {
        contactosDetails: [] as LeadDetail[],
        socialSellingDetails: [] as LeadDetail[],
        contactoCalidoDetails: [] as LeadDetail[],
        citaAgendadaDetails: [] as LeadDetail[],
        citaAtendidaDetails: [] as LeadDetail[],
        citaValidadaDetails: [] as LeadDetail[],
        asignadasDetails: [] as LeadDetail[],
      };

      for (const lead of leads) {
        // Solo incluir leads que existían durante el período
        if (lead.createdAt > fechaFin) {
          continue; // Lead creado después del período
        }

        // Función para obtener el estado del lead en una fecha específica
        const obtenerEstadoEnFecha = (fecha: Date): LeadStatus => {
          // Estado inicial cuando se creó el lead
          let estadoActual: LeadStatus = LeadStatus.Contacto; // Por defecto, los leads empiezan como Contacto

          // Recorrer el historial cronológicamente hasta la fecha especificada
          for (const historyEntry of lead.statusHistory) {
            if (historyEntry.changedAt <= fecha) {
              estadoActual = historyEntry.status;
            } else {
              break; // Ya pasamos de la fecha objetivo
            }
          }

          return estadoActual;
        };

        // FOTOGRAFÍA: Determinar el estado del lead en el momento específico (final del período)
        // Esto nos da una "fotografía" de cómo estaban TODOS los leads en un momento exacto
        let estadoEnPeriodo: LeadStatus | null = null;

        // Si el lead no existía aún en el momento de la fotografía, no lo contamos
        if (lead.createdAt <= fechaFin) {
          // Tomar el estado que tenía el lead en el momento específico (final del período)
          estadoEnPeriodo = obtenerEstadoEnFecha(fechaFin);
        }

        // Contar según el estado y almacenar detalles
        if (estadoEnPeriodo) {
          const leadDetail: LeadDetail = {
            id: lead.id,
            empresa: lead.empresa,
            createdAt: lead.createdAt,
            currentStatus: lead.status,
            statusInPeriod: estadoEnPeriodo,
          };

          switch (estadoEnPeriodo) {
            case LeadStatus.Contacto:
              estadisticas.contactos++;
              detallesPorEstado.contactosDetails.push(leadDetail);
              break;
            case LeadStatus.SocialSelling:
              estadisticas.socialSelling++;
              detallesPorEstado.socialSellingDetails.push(leadDetail);
              break;
            case LeadStatus.ContactoCalido:
              estadisticas.contactoCalido++;
              detallesPorEstado.contactoCalidoDetails.push(leadDetail);
              break;
            case LeadStatus.CitaAgendada:
              estadisticas.citaAgendada++;
              detallesPorEstado.citaAgendadaDetails.push(leadDetail);
              break;
            case LeadStatus.CitaAtendida:
              estadisticas.citaAtendida++;
              detallesPorEstado.citaAtendidaDetails.push(leadDetail);
              break;
            case LeadStatus.CitaValidada:
              estadisticas.citaValidada++;
              detallesPorEstado.citaValidadaDetails.push(leadDetail);
              break;
            case LeadStatus.Asignadas:
              estadisticas.asignadas++;
              detallesPorEstado.asignadasDetails.push(leadDetail);
              break;
          }
        }
      }

      const total = Object.values(estadisticas).reduce(
        (sum, count) => sum + count,
        0
      );

      reportData.push({
        generadorId: generador.id,
        generadorName: generador.name,
        periodo: `Fotografía al ${fechaFin.toLocaleDateString()}`,
        ...estadisticas,
        total,
        ...detallesPorEstado,
      });
    }

    return reportData;
  } catch (error) {
    console.error("Error al generar reporte de leads:", error);
    throw new Error("Error al generar el reporte de leads");
  }
}

export async function getLeadGenerators() {
  try {
    const generadores = await prisma.user.findMany({
      where: {
        Lead: {
          some: {}, // Solo usuarios que tienen leads
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return generadores;
  } catch (error) {
    console.error("Error al obtener generadores de leads:", error);
    throw new Error("Error al obtener los generadores de leads");
  }
}

// Función para obtener estadísticas agregadas
export async function getLeadReportSummary(filters: LeadReportFilters) {
  try {
    const reportData = await getLeadReports(filters);

    const summary = reportData.reduce(
      (acc, curr) => ({
        totalGeneradores: acc.totalGeneradores + 1,
        totalContactos: acc.totalContactos + curr.contactos,
        totalSocialSelling: acc.totalSocialSelling + curr.socialSelling,
        totalContactoCalido: acc.totalContactoCalido + curr.contactoCalido,
        totalCitaAgendada: acc.totalCitaAgendada + curr.citaAgendada,
        totalCitaAtendida: acc.totalCitaAtendida + curr.citaAtendida,
        totalCitaValidada: acc.totalCitaValidada + curr.citaValidada,
        totalAsignadas: acc.totalAsignadas + curr.asignadas,
        totalGeneral: acc.totalGeneral + curr.total,
      }),
      {
        totalGeneradores: 0,
        totalContactos: 0,
        totalSocialSelling: 0,
        totalContactoCalido: 0,
        totalCitaAgendada: 0,
        totalCitaAtendida: 0,
        totalCitaValidada: 0,
        totalAsignadas: 0,
        totalGeneral: 0,
      }
    );

    return summary;
  } catch (error) {
    console.error("Error al generar resumen del reporte:", error);
    throw new Error("Error al generar el resumen del reporte");
  }
}
