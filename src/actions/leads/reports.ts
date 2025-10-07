"use server";

import prisma from "@/core/lib/db";
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
        // 1. CONTAR LEAD COMO "CONTACTO" SI FUE CREADO DURANTE EL PERÍODO
        if (lead.createdAt >= fechaInicio && lead.createdAt <= fechaFin) {
          estadisticas.contactos++;
          detallesPorEstado.contactosDetails.push({
            id: lead.id,
            empresa: lead.empresa,
            createdAt: lead.createdAt,
            currentStatus: lead.status,
            statusInPeriod: LeadStatus.Contacto,
          });
        }

        // 2. CONTAR TODOS LOS CAMBIOS DE ESTADO QUE OCURRIERON DURANTE EL PERÍODO
        // IMPORTANTE: No contamos cambios a "Contacto" para evitar duplicados,
        // ya que la creación de un lead ya cuenta como "Contacto"
        for (const historyEntry of lead.statusHistory) {
          // Solo contar cambios que ocurrieron dentro del período
          if (
            historyEntry.changedAt >= fechaInicio &&
            historyEntry.changedAt <= fechaFin
          ) {
            const leadDetail: LeadDetail = {
              id: lead.id,
              empresa: lead.empresa,
              createdAt: lead.createdAt,
              currentStatus: lead.status,
              statusInPeriod: historyEntry.status,
            };

            // Contar y almacenar según el estado al que cambió
            // NOTA: Excluimos LeadStatus.Contacto para evitar duplicados con la creación
            switch (historyEntry.status) {
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
              // Intencionalmente omitimos LeadStatus.Contacto aquí
              // porque ya se cuenta cuando el lead se crea
            }
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
        periodo: `Actividad: ${fechaInicio.toLocaleDateString()} - ${fechaFin.toLocaleDateString()}`,
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
