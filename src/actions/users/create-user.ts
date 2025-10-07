"use server";
import { checkSession } from "@/hooks/auth/checkSession";
import { parseWithZod } from "@conform-to/zod";
import { createUserSchema } from "@/zod/createUserSchema";
import bcrypt from "bcryptjs";
import prisma from "@/core/lib/db";
import { revalidatePath } from "next/cache";
import { editUserSchema } from "@/zod/editUserSchema";
import { Role } from "@prisma/client";
import { deleteAnyFile } from "../files/actions";

export const getLeadsUsers = async () => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ["GL", "MK", "Admin"],
        },
      },
    });
    return users;
  } catch (err) {
    console.log(err);
    throw new Error("Error al devolver los usuarios");
  }
};

export const deleteUserProfileImage = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.image) return;
    await deleteAnyFile(user.image);

    await prisma.user.update({
      where: { id: userId },
      data: { image: null },
    });

    revalidatePath(`/profile/${userId}`);
    return {
      ok: true,
      message: "Imagen removida",
    };
  } catch (err) {
    throw new Error("No se pudo eliminar la imagen");
  }
};

export const editUser = async (userId: string, formData: FormData) => {
  const session = await checkSession("/sing-in");

  if (session.user?.role !== Role.Admin) {
    throw Error("Unauthorize");
  }

  const submission = parseWithZod(formData, {
    schema: editUserSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw Error("User does not exists");
  }

  if (submission.value.image) {
    if (existingUser.image) {
      await deleteUserProfileImage(userId);
      existingUser.image = submission.value.image;
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      age: submission.value.age || existingUser.age,
      celular: submission.value.celular || existingUser.celular,
      direccion: submission.value.direccion || existingUser.direccion,
      email: submission.value.email || existingUser.email,
      name: submission.value.name || existingUser.name,
      password: submission.value.password
        ? bcrypt.hashSync(submission.value.password, 10) // Si se pasa una nueva contraseña, la actualizamos
        : existingUser.password,
      Oficina: submission.value.oficina || existingUser.Oficina,
      State: submission.value.status || existingUser.State,
      role: submission.value.role || existingUser.role,
      image: submission.value.image || existingUser.image,
      ingreso: submission.value.ingreso || existingUser.ingreso,
    },
  });

  revalidatePath("/list/users");
  revalidatePath(`/profile/${userId}`);
};

export const createUser = async (prevState: any, formData: FormData) => {
  await checkSession("/sign-in");

  const submission = parseWithZod(formData, {
    schema: createUserSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  try {
    // Check if username already exists (exact match, case insensitive)
    const userExists = await prisma.user.findFirst({
      where: {
        name: {
          equals: submission.value.name, // Usamos equals para coincidencia exacta
          mode: "insensitive",
        },
      },
    });

    if (userExists) {
      return submission.reply({
        fieldErrors: {
          name: ["Ya existe un usuario con este nombre exacto"],
        },
        formErrors: ["error"],
      });
    }

    await prisma.user.create({
      data: {
        age: submission.value.age,
        celular: submission.value.celular,
        direccion: submission.value.direccion,
        email: submission.value.email,
        name: submission.value.name,
        password: bcrypt.hashSync(submission.value.password, 10),
        Oficina: submission.value.oficina,
        State: submission.value.status,
        role: submission.value.role,
        image: submission.value.image,
        //ingreso: submission.value.ingreso,
      },
    });

    revalidatePath("/list/users");
    return submission.reply();
  } catch (error) {
    console.error(error);
    return submission.reply({
      formErrors: ["Ocurrió un error al crear el usuario"],
    });
  }
};
