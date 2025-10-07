"use server";

import { auth } from "@/core/lib/auth";
import prisma from "@/core/lib/db";
import { VacancyEstado } from "@prisma/client";

//Crear funcion para crear el historial faltante de ciertas vacantes

export const createVacancyHistory = async ({
  status,
  vacancyId,
  changedAt,
}: {
  vacancyId: string;
  status: VacancyEstado;
  changedAt?: Date;
}) => {
  try {
    //buscar sesion
    const session = await auth();
    if (!session?.user) {
      console.error("No se encontró la sesión");
      return {
        ok: false,
        message: "No se encontró la sesión",
      };
    }

    //buscar la vacante
    const vacancy = await prisma.vacancy.findUnique({
      where: {
        id: vacancyId,
      },
    });
    if (!vacancy) {
      return {
        ok: false,
        message: "No se encontró la vacante",
      };
    }

    //crear el historial faltante
    await prisma.vacancyStatusHistory.create({
      data: {
        vacancyId: vacancyId,
        status: status,
        changedById: session.user.id,
        changedAt: changedAt || new Date(),
      },
    });
  } catch (error) {
    console.error("Error al crear el historial de la vacante:", error);
    return {
      ok: false,
      message: "Error al crear el historial de la vacante",
    };
  }
};
