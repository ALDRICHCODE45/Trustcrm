"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { NotificationType, Role } from "@prisma/client";
import {
  NotificationVacancyType,
  createVacancyNotificationProps,
} from "@/types/vacancy-notifications";

export const createVacancyNotification = async ({
  vacancyId,
  type,
}: createVacancyNotificationProps) => {
  try {
    //Obtener los usuarios recipientes
    const usersRecipients = await prisma.user.findMany({
      where: {
        role: Role.Admin,
      },
    });
    if (!usersRecipients) {
      return {
        ok: false,
        message: "No se encontraron usuarios recipientes",
      };
    }
    //obtener el usuario  que subio el checlist
    const session = await auth();
    if (!session?.user) {
      return {
        ok: false,
        message: "No se encontró la sesión",
      };
    }

    //obtener la vacante para usar la posicion
    const vacancy = await prisma.vacancy.findUnique({
      where: {
        id: vacancyId,
      },
      select: {
        posicion: true,
      },
    });

    if (!vacancy) {
      return {
        ok: false,
        message: "No se encontró la vacante",
      };
    }

    //obtener el mensaje de la notificacion inline
    let message: string;
    switch (type) {
      case NotificationVacancyType.Checklist:
        message = "Ha subido un nuevo checklist para la posicion";
        break;
      case NotificationVacancyType.JobDescription:
        message = "Ha subido un nuevo Job Description para la posicion";
        break;
      case NotificationVacancyType.PerfilMuestra:
        message = "Ha subido un nuevo Perfil Muestra para la posicion";
        break;
    }

    //Pasar los datos a la notificacion
    for (const user of usersRecipients) {
      await prisma.notification.create({
        data: {
          type: NotificationType.Vacancy,
          message: `El usuario ${session.user.name} ${message} ${vacancy.posicion}`,
          recipientId: user.id,
          vacancyId,
        },
      });
    }

    return {
      ok: true,
      message: "Notificacion creada correctamente",
    };
  } catch (er) {
    return {
      ok: false,
      message: "Error al crear la notificacion",
    };
  }
};
