"use server";

import { auth } from "@/core/lib/auth";
import prisma from "@/core/lib/db";
import { Role, User } from "@prisma/client";

export const getReclutadores = async (): Promise<{
  ok: boolean;
  message: string;
  users: User[];
}> => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: Role.reclutador,
      },
    });
    return {
      ok: true,
      message: "Reclutadores obtenidos correctamente",
      users,
    };
  } catch (error) {
    return {
      ok: false,
      message: "Error al obtener los reclutadores",
      users: [],
    };
  }
};

export const getLoggedUser = async (): Promise<{
  ok: boolean;
  message: string;
  user: User | null;
}> => {
  try {
    const user = await auth();
    if (!user?.user) {
      return {
        ok: false,
        message: "Error al obtener el usuario logeado",
        user: null,
      };
    }
    return {
      ok: true,
      message: "Usuario logeado obtenido correctamente",
      user: user.user as User,
    };
  } catch (error) {
    return {
      ok: false,
      message: "Error al obtener el usuario logeado",
      user: null,
    };
  }
};
