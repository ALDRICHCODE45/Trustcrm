"use server";
import prisma from "@/lib/db";
import { LeadStatus } from "@prisma/client";

interface Args {
  id: string;
  status: LeadStatus;
  changedAt: Date;
}

export const editLeadHistoryById = async (data: Args) => {
  try {
    //buscar el lead history por id
    const history = await prisma.leadStatusHistory.findUnique({
      where: {
        id: data.id,
      },
    });
    if (!editLeadHistoryById) {
      return {
        ok: false,
        message: "Historial no encontrado",
      };
    }

    //actualizar el lead history
    await prisma.leadStatusHistory.update({
      where: {
        id: data.id,
      },
      data: {
        status: data.status,
        changedAt: data.changedAt,
      },
    });
    return { ok: true, message: "Historial editado correctamente" };
  } catch (e) {
    return {
      ok: false,
      message: "Error al editar el historial del lead",
    };
  }
};
