"use server";
import prisma from "@/core/lib/db";
import { Role, VacancyEstado } from "@prisma/client";

export interface ReclutadorStats {
  id: string;
  name: string;
  image?: string | null;
  totalVacantes: number;
  hunting: number;
  entrevistas: number;
  placement: number;
  canceladas: number;
  perdidas: number;
  prePlacement: number;
  quickMeeting: number;
}

export const getVacancyStatsByRecruiter = async (): Promise<
  ReclutadorStats[]
> => {
  try {
    const reclutadores = await prisma.user.findMany({
      where: {
        role: Role.reclutador,
      },
      include: {
        vacanciesReclutador: {
          select: {
            estado: true,
          },
        },
      },
    });

    const stats: ReclutadorStats[] = reclutadores.map((reclutador) => {
      const vacantes = reclutador.vacanciesReclutador;
      const totalVacantes = vacantes.length;

      // Contar vacantes por estado
      const hunting = vacantes.filter(
        (v) => v.estado === VacancyEstado.Hunting
      ).length;
      const entrevistas = vacantes.filter(
        (v) => v.estado === VacancyEstado.Entrevistas
      ).length;
      const placement = vacantes.filter(
        (v) => v.estado === VacancyEstado.Placement
      ).length;
      const canceladas = vacantes.filter(
        (v) => v.estado === VacancyEstado.Cancelada
      ).length;
      const perdidas = vacantes.filter(
        (v) => v.estado === VacancyEstado.Perdida
      ).length;
      const prePlacement = vacantes.filter(
        (v) => v.estado === VacancyEstado.PrePlacement
      ).length;
      const quickMeeting = vacantes.filter(
        (v) => v.estado === VacancyEstado.QuickMeeting
      ).length;

      return {
        id: reclutador.id,
        name: reclutador.name,
        image: reclutador.image,
        totalVacantes,
        hunting,
        entrevistas,
        placement,
        canceladas,
        perdidas,
        prePlacement,
        quickMeeting,
      };
    });

    // Ordenar por total de vacantes descendente
    return stats.sort((a, b) => b.totalVacantes - a.totalVacantes);
  } catch (error) {
    console.error("Error fetching vacancy stats:", error);
    throw new Error("No se pudieron obtener las estadísticas de vacantes");
  }
};
