"use server";
import { checkSession } from "@/hooks/auth/checkSession";
import prisma from "@/core/lib/db"; // tu instancia de Prisma
import { UserState } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function desactivateUsers(ids: string[]) {
  if (!ids || ids.length === 0) return;

  await prisma.user.updateMany({
    where: {
      id: {
        in: ids,
      },
    },
    data: {
      State: UserState.INACTIVO,
    },
  });

  revalidatePath("/list/users");
}

//fucion para eliminar solo un usuario con sus relaciones
export const deleteUserById = async (userId: string) => {
  await checkSession();
  try {
    const existsUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!existsUser) {
      return {
        ok: false,
        message: "El usuario no existe",
      };
    }

    //deletear usuarios
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });
    revalidatePath("/list/users");
    return {
      ok: true,
      message: "Usuario eliminado correctamente",
    };
  } catch (err) {
    throw new Error("Error al eliminar el usuario");
  }
};

//funcion para eliminar permanentemente ususarios y sus relaciones
export const removeUsers = async (ids: string[]) => {
  if (!ids || ids.length === 0) return;

  await prisma.user.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });

  revalidatePath("/list/users"); // o la ruta que estés usando
};
