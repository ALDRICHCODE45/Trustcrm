"use server";

import prisma from "@/core/lib/db";
import { VacancyEstado } from "@prisma/client";

export interface VacancyDetail {
  id: string;
  posicion: string;
  clienteNombre: string;
  createdAt: Date;
  currentStatus: string;
  statusInPeriod: string;
}

export interface VacancyReportData {
  reclutadorId: string;
  reclutadorName: string;
  periodo: string;
  quickMeeting: number;
  hunting: number;
  entrevistas: number;
  prePlacement: number;
  placement: number;
  cancelada: number;
  perdida: number;
  standBy: number;
  total: number;
  // Detalles de vacantes por estado
  quickMeetingDetails: VacancyDetail[];
  huntingDetails: VacancyDetail[];
  entrevistasDetails: VacancyDetail[];
  prePlacementDetails: VacancyDetail[];
  placementDetails: VacancyDetail[];
  canceladaDetails: VacancyDetail[];
  perdidaDetails: VacancyDetail[];
  standByDetails: VacancyDetail[];
}

export interface VacancyReportFilters {
  reclutadorId?: string;
  fechaInicio: Date;
  fechaFin: Date;
}

export async function getVacancyReports(
  filters: VacancyReportFilters
): Promise<VacancyReportData[]> {
  try {
    const { reclutadorId, fechaInicio, fechaFin } = filters;

    // Si se especifica un reclutador, obtener solo ese, sino todos
    const whereClause = reclutadorId ? { id: reclutadorId } : {};

    const reclutadores = await prisma.user.findMany({
      where: {
        ...whereClause,
        vacanciesReclutador: {
          some: {}, // Solo usuarios que tienen vacantes asignadas
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const reportData: VacancyReportData[] = [];

    for (const reclutador of reclutadores) {
      // Obtener todas las vacantes del reclutador que existían antes o durante el período
      const vacancies = await prisma.vacancy.findMany({
        where: {
          reclutadorId: reclutador.id,
          createdAt: {
            lte: fechaFin, // Solo vacantes que existían al final del período
          },
        },
        include: {
          statusHistory: {
            orderBy: {
              changedAt: "asc", // Ordenar por fecha ascendente para seguir la cronología
            },
          },
          cliente: {
            select: {
              cuenta: true,
            },
          },
        },
      });

      // Contar los estados en el período especificado
      const estadisticas = {
        quickMeeting: 0,
        hunting: 0,
        entrevistas: 0,
        prePlacement: 0,
        placement: 0,
        cancelada: 0,
        perdida: 0,
        standBy: 0,
      };

      // Arrays para almacenar los detalles de vacantes por estado
      const detallesPorEstado = {
        quickMeetingDetails: [] as VacancyDetail[],
        huntingDetails: [] as VacancyDetail[],
        entrevistasDetails: [] as VacancyDetail[],
        prePlacementDetails: [] as VacancyDetail[],
        placementDetails: [] as VacancyDetail[],
        canceladaDetails: [] as VacancyDetail[],
        perdidaDetails: [] as VacancyDetail[],
        standByDetails: [] as VacancyDetail[],
      };

      for (const vacancy of vacancies) {
        // 1. CONTAR VACANTE EN SU ESTADO INICIAL SI FUE CREADA DURANTE EL PERÍODO
        if (
          vacancy.createdAt &&
          vacancy.createdAt >= fechaInicio &&
          vacancy.createdAt <= fechaFin
        ) {
          const vacancyDetail: VacancyDetail = {
            id: vacancy.id,
            posicion: vacancy.posicion,
            clienteNombre: vacancy.cliente.cuenta || "Sin cuenta",
            createdAt: vacancy.createdAt,
            currentStatus: vacancy.estado,
            statusInPeriod: vacancy.estado,
          };

          // Contar la creación según el estado inicial
          switch (vacancy.estado) {
            case VacancyEstado.QuickMeeting:
              estadisticas.quickMeeting++;
              detallesPorEstado.quickMeetingDetails.push(vacancyDetail);
              break;
            case VacancyEstado.Hunting:
              estadisticas.hunting++;
              detallesPorEstado.huntingDetails.push(vacancyDetail);
              break;
            case VacancyEstado.Entrevistas:
              estadisticas.entrevistas++;
              detallesPorEstado.entrevistasDetails.push(vacancyDetail);
              break;
            case VacancyEstado.PrePlacement:
              estadisticas.prePlacement++;
              detallesPorEstado.prePlacementDetails.push(vacancyDetail);
              break;
            case VacancyEstado.Placement:
              estadisticas.placement++;
              detallesPorEstado.placementDetails.push(vacancyDetail);
              break;
            case VacancyEstado.Cancelada:
              estadisticas.cancelada++;
              detallesPorEstado.canceladaDetails.push(vacancyDetail);
              break;
            case VacancyEstado.Perdida:
              estadisticas.perdida++;
              detallesPorEstado.perdidaDetails.push(vacancyDetail);
              break;
            case VacancyEstado.StandBy:
              estadisticas.standBy++;
              detallesPorEstado.standByDetails.push(vacancyDetail);
              break;
          }
        }

        // 2. CONTAR TODOS LOS CAMBIOS DE ESTADO QUE OCURRIERON DURANTE EL PERÍODO
        for (const historyEntry of vacancy.statusHistory) {
          // Solo contar cambios que ocurrieron dentro del período
          if (
            historyEntry.changedAt >= fechaInicio &&
            historyEntry.changedAt <= fechaFin
          ) {
            const vacancyDetail: VacancyDetail = {
              id: vacancy.id,
              posicion: vacancy.posicion,
              clienteNombre: vacancy.cliente.cuenta || "Sin cuenta",
              createdAt: vacancy.createdAt || new Date(),
              currentStatus: vacancy.estado,
              statusInPeriod: historyEntry.status,
            };

            // Contar y almacenar según el estado al que cambió
            switch (historyEntry.status) {
              case VacancyEstado.QuickMeeting:
                estadisticas.quickMeeting++;
                detallesPorEstado.quickMeetingDetails.push(vacancyDetail);
                break;
              case VacancyEstado.Hunting:
                estadisticas.hunting++;
                detallesPorEstado.huntingDetails.push(vacancyDetail);
                break;
              case VacancyEstado.Entrevistas:
                estadisticas.entrevistas++;
                detallesPorEstado.entrevistasDetails.push(vacancyDetail);
                break;
              case VacancyEstado.PrePlacement:
                estadisticas.prePlacement++;
                detallesPorEstado.prePlacementDetails.push(vacancyDetail);
                break;
              case VacancyEstado.Placement:
                estadisticas.placement++;
                detallesPorEstado.placementDetails.push(vacancyDetail);
                break;
              case VacancyEstado.Cancelada:
                estadisticas.cancelada++;
                detallesPorEstado.canceladaDetails.push(vacancyDetail);
                break;
              case VacancyEstado.Perdida:
                estadisticas.perdida++;
                detallesPorEstado.perdidaDetails.push(vacancyDetail);
                break;
              case VacancyEstado.StandBy:
                estadisticas.standBy++;
                detallesPorEstado.standByDetails.push(vacancyDetail);
                break;
            }
          }
        }
      }

      const total = Object.values(estadisticas).reduce(
        (sum, count) => sum + count,
        0
      );

      reportData.push({
        reclutadorId: reclutador.id,
        reclutadorName: reclutador.name,
        periodo: `Actividad: ${fechaInicio.toLocaleDateString()} - ${fechaFin.toLocaleDateString()}`,
        ...estadisticas,
        total,
        ...detallesPorEstado,
      });
    }

    return reportData;
  } catch (error) {
    console.error("Error al generar reporte de vacantes:", error);
    throw new Error("Error al generar el reporte de vacantes");
  }
}

export async function getRecruiters() {
  try {
    const reclutadores = await prisma.user.findMany({
      where: {
        vacanciesReclutador: {
          some: {}, // Solo usuarios que tienen vacantes asignadas
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

    return reclutadores;
  } catch (error) {
    console.error("Error al obtener reclutadores:", error);
    throw new Error("Error al obtener los reclutadores");
  }
}

// Función para obtener estadísticas agregadas
export async function getVacancyReportSummary(filters: VacancyReportFilters) {
  try {
    const reportData = await getVacancyReports(filters);

    const summary = reportData.reduce(
      (acc, curr) => ({
        totalReclutadores: acc.totalReclutadores + 1,
        totalQuickMeeting: acc.totalQuickMeeting + curr.quickMeeting,
        totalHunting: acc.totalHunting + curr.hunting,
        totalEntrevistas: acc.totalEntrevistas + curr.entrevistas,
        totalPrePlacement: acc.totalPrePlacement + curr.prePlacement,
        totalPlacement: acc.totalPlacement + curr.placement,
        totalCancelada: acc.totalCancelada + curr.cancelada,
        totalPerdida: acc.totalPerdida + curr.perdida,
        totalStandBy: acc.totalStandBy + curr.standBy,
        totalGeneral: acc.totalGeneral + curr.total,
      }),
      {
        totalReclutadores: 0,
        totalQuickMeeting: 0,
        totalHunting: 0,
        totalEntrevistas: 0,
        totalPrePlacement: 0,
        totalPlacement: 0,
        totalCancelada: 0,
        totalPerdida: 0,
        totalStandBy: 0,
        totalGeneral: 0,
      }
    );

    return summary;
  } catch (error) {
    console.error("Error al generar resumen del reporte:", error);
    throw new Error("Error al generar el resumen del reporte");
  }
}
