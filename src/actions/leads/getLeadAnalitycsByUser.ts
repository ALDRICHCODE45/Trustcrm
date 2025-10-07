"use server";
import { auth } from "@/core/lib/auth";
import prisma from "@/core/lib/db";
import { LeadStatus } from "@prisma/client";

interface Mes {
  mes: string;
  contactos: number;
  socialSelling: number;
  contactosCalidos: number;
  citasAgendadas: number;
  citasValidadas: number;
  asignadas: number;
  citasAtendidas: number;
}

export const getAnalitycsByUserAction = async (userId: string) => {
  const session = await auth();
  if (!session) {
    throw new Error("User is not authenticated");
  }

  if (!userId) {
    throw new Error("UserId is required");
  }

  try {
    const dataPorMes = await createDataByMonth(userId);
    return dataPorMes;
  } catch (err) {
    throw new Error("Error al cargar los leads por mes");
  }
};

const createDataByMonth = async (userId: string) => {
  // Configurar fechas para el año actual
  const currentYear = new Date().getFullYear();
  const startDate = new Date(currentYear, 0, 1); // 1 de enero del año actual
  const endDate = new Date(currentYear, 11, 31); // 31 de diciembre del año actual

  // Consultar todos los leads generados por este usuario en el año actual
  const leads = await prisma.lead.findMany({
    where: {
      generadorId: userId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  //contar los clientes que ese usuario ha realizado
  const statusClientsChanges = await prisma.leadStatusHistory.findMany({
    where: {
      changedById: userId,
      status: LeadStatus.Asignadas,
      changedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });
  //contar todos los SocialSelling que ese usuario ha creado
  const statusSocialSelling = await prisma.leadStatusHistory.findMany({
    where: {
      changedById: userId,
      status: LeadStatus.SocialSelling,
      changedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  //contar los Contactos calidos que el usuario ha creado
  const statusContactoCalido = await prisma.leadStatusHistory.findMany({
    where: {
      changedById: userId,
      status: LeadStatus.ContactoCalido,
      changedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  //contar las citas agendadas de ese mes con ese lead
  const statusCitasAgendadas = await prisma.leadStatusHistory.findMany({
    where: {
      changedById: userId,
      status: LeadStatus.CitaAgendada,
      changedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  //contar las citas validadas en el mes seleccionado
  const statusCitasValidadas = await prisma.leadStatusHistory.findMany({
    where: {
      changedById: userId,
      status: LeadStatus.CitaValidada,
      changedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  //contar las citas validadas en el mes seleccionado
  const statusCitasAtendidas = await prisma.leadStatusHistory.findMany({
    where: {
      changedById: userId,
      status: LeadStatus.CitaAtendida,
      changedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Crear array con datos para cada mes

  const dataByMes: Mes[] = Array.from({ length: 12 }, (_, monthIndex) => {
    const monthName = new Date(0, monthIndex).toLocaleString("es-ES", {
      month: "long",
    });

    //contar leads Totales (contactos) creados en ese mes
    const contactos = leads.filter(
      (lead) => lead.createdAt.getMonth() === monthIndex,
    ).length;

    //contar cuantos clientes en este mes
    const asignadas = statusClientsChanges.filter(
      (client) => client.changedAt.getMonth() === monthIndex,
    ).length;

    //contar socialSelling
    const socialSelling = statusSocialSelling.filter(
      (lead) => lead.changedAt.getMonth() === monthIndex,
    ).length;

    //contar contactosCalidos
    const contactosCalidos = statusContactoCalido.filter(
      (lead) => lead.changedAt.getMonth() === monthIndex,
    ).length;

    //contar citasAgendadas
    const citasAgendadas = statusCitasAgendadas.filter(
      (lead) => lead.changedAt.getMonth() === monthIndex,
    ).length;

    //contar citas Validadas
    const citasValidadas = statusCitasValidadas.filter(
      (lead) => lead.changedAt.getMonth() === monthIndex,
    ).length;

    const citasAtendidas = statusCitasAtendidas.filter(
      (lead) => lead.changedAt.getMonth() === monthIndex,
    ).length;

    return {
      mes: monthName.charAt(0).toUpperCase() + monthName.slice(1, 3),
      contactos: contactos,
      socialSelling: socialSelling,
      contactosCalidos: contactosCalidos,
      citasAgendadas: citasAgendadas,
      citasValidadas: citasValidadas,
      citasAtendidas: citasAtendidas,
      asignadas,
    };
  });

  return dataByMes;
};
