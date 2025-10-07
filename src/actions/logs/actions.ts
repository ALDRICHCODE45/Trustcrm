"use server";
import prisma from "@/core/lib/db";
import { LogAction } from "@prisma/client";
import { revalidatePath } from "next/cache";

export const deleteLog = async (logId: string) => {
  try {
    const existsLog = await prisma.log.findUnique({
      where: {
        id: logId,
      },
    });
    if (!existsLog) {
      return {
        ok: false,
        message: "[ERORR]: El log ah eliminar no existe",
      };
    }

    await prisma.log.delete({
      where: {
        id: logId,
      },
    });
    revalidatePath("/sistema/logs");
    return {
      ok: true,
      message: "LOG eliminado con exito",
    };
  } catch (err) {
    throw new Error("Error eliminando el log");
  }
};

export const createLog = async (formData: FormData, action: LogAction) => {
  try {
    const userId = formData.get("userId") as string;
    const file = formData.get("file") as string;
    const modulo = formData.get("file") as string;

    console.log("CreateLog action parameters:", { userId, file });

    const userExist = prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!userId) {
      return {
        ok: false,
        message: "User does not exists",
      };
    }

    await prisma.log.create({
      data: {
        autorId: userId,
        action,
        file,

        //TODO:Implementar logs module
      },
    });

    return {
      ok: true,
      message: "User exists",
    };
  } catch (error) {
    throw new Error("Server Error: Error al crear el log");
  }
};
