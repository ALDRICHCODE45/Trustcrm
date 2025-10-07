"use server";
import prisma from "@/core/lib/db";
import { VacancyEstado } from "@prisma/client";

//Funciones para obtener cuantas vacantes asigandadas | En placement, etc... hay por cliente
// -> Obtener todas las asignadas independientemente del estado
export const getClientAsignadas = async (id: string) => {
  try {
    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) {
      return {
        ok: false,
        message: "Cliente no encontrado",
      };
    }
    console.log(client.id);

    const asignadas = await prisma.vacancy.count({
      where: {
        clienteId: client.id,
      },
    });
    console.log({ asignadas });

    return {
      ok: true,
      message: "Vacantes asignadas obtenidas correctamente",
      data: asignadas,
    };
  } catch (err) {
    console.error(err);
    return {
      ok: false,
      data: null,
      message: "Error al obtener las vacantes asignadas",
    };
  }
};

// -> Obtener todas las perdidas
export const getClientEnPerdidas = async (id: string) => {
  try {
    const client = await prisma.client.findUnique({
      where: {
        id,
      },
    });
    if (!client) {
      return {
        ok: false,
        message: "Cliente no encontrado",
      };
    }

    const perdidas = await prisma.vacancy.count({
      where: {
        clienteId: client.id,
        estado: VacancyEstado.Perdida,
      },
    });

    return {
      ok: true,
      message: "Vacantes en perdidas obtenidas correctamente",
      data: perdidas,
    };
  } catch (err) {
    console.error(err);
    return {
      ok: false,
      message: "Error al obtener las vacantes en perdidas",
    };
  }
};

// -> Obtener todas las canceladas
export const getClientCanceladas = async (id: string) => {
  try {
    const client = await prisma.client.findUnique({
      where: {
        id,
      },
    });
    if (!client) {
      return {
        ok: false,
        message: "Cliente no encontrado",
      };
    }

    const canceladas = await prisma.vacancy.count({
      where: {
        clienteId: client.id,
        estado: VacancyEstado.Cancelada,
      },
    });

    return {
      ok: true,
      message: "Vacantes canceladas obtenidas correctamente",
      data: canceladas,
    };
  } catch (err) {
    console.error(err);
    return {
      ok: false,
      message: "Error al obtener las vacantes canceladas",
    };
  }
};

// -> Obtener todas las en placement
export const getClientEnPlacement = async (id: string) => {
  try {
    const client = await prisma.client.findUnique({
      where: {
        id,
      },
    });
    if (!client) {
      return {
        ok: false,
        message: "Cliente no encontrado",
      };
    }

    const enPlacement = await prisma.vacancy.count({
      where: {
        clienteId: client.id,
        estado: VacancyEstado.Placement,
      },
    });

    return {
      ok: true,
      message: "Vacantes en placement obtenidas correctamente",
      data: enPlacement,
    };
  } catch (err) {
    console.error(err);
    return {
      ok: false,
      message: "Error al obtener las vacantes en placement",
    };
  }
};
