"use server";

import prisma from "@/core/lib/db";

export const getAllSectores = async () => {
  try {
    const sectores = await prisma.sector.findMany();
    return sectores;
  } catch (err) {
    throw new Error("No se pueden obtener los sectores");
  }
};

export const getAllOrigenes = async () => {
  try {
    const origenes = await prisma.leadOrigen.findMany();
    return origenes;
  } catch (err) {
    throw new Error("No se pudo fetchear los origenes");
  }
};
