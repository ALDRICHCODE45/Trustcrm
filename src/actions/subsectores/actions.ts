"use server";

import prisma from "@/core/lib/db";

export const createSubSector = async (subSector: string) => {
  try {
    await prisma.subSector.create({
      data: {
        nombre: subSector,
      },
    });
    return {
      ok: true,
      message: "Subsector creado con exito",
    };
  } catch (err) {
    throw new Error("Error creando el subsector");
  }
};

export const getAllSubSectores = async () => {
  try {
    const subSectores = await prisma.subSector.findMany();
    return subSectores;
  } catch (error) {
    throw new Error("Error trayendo los subsectores");
  }
};
