"use server";
import { auth } from "@/lib/auth";
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

interface createLeadHistoryArgs {
  leadId: string;
  status: LeadStatus;
  changedAt: Date;
}

export const createLeadHistory = async ({ changedAt, leadId, status }: createLeadHistoryArgs) => {
  try {
    const session = await auth();
    if (!session?.user) {
      return {
        ok: false,
        message: "No autorizado",
      };
    }
    //crear el lead history
    await prisma.leadStatusHistory.create({
      data: {
        leadId,
        status,
        changedAt,
        changedById: session.user.id,
      },
    });
    return { ok: true, message: "Historial creado correctamente" };
  } catch (e) {
    return {
      ok: false,
      message: "Error al crear el historial del lead",
    };
  }
};
