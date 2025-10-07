"use server";
import { parseWithZod } from "@conform-to/zod";
import { checkSession } from "@/hooks/auth/checkSession";
import {
  createLeadPersonSchema,
  editLeadPersonSchema,
} from "@/zod/createLeadPersonSchema";
import prisma from "@/core/lib/db";
import { revalidatePath } from "next/cache";
import { deleteAnyFile, deleteFile, uploadFile } from "../files/actions";
import { auth } from "@/core/lib/auth";

export const uploadNewCvToCandidate = async (personId: string, file: File) => {
  try {
    const user = await auth();
    if (!user?.user) {
      return {
        ok: false,
        message: "Usuario no autenticado",
      };
    }
    const currentUserId = user.user.id;

    // subir el archivo a cloudinary
    const formData = new FormData();
    formData.append("file", file);
    const uploadedUrl = await uploadFile(formData);

    if (!uploadedUrl.ok || !uploadedUrl.url) {
      return {
        ok: false,
        message: "Error al subir el cv a cloudinary",
      };
    }

    // crear el archivo en la base de datos
    const fileCreated = await prisma.vacancyFile.create({
      data: {
        authorId: currentUserId,
        url: uploadedUrl.url,
        name: file.name,
        mimeType: file.type,
        size: file.size,
      },
    });

    // actualizar el candidato con el id del archivo
    await prisma.person.update({
      where: { id: personId },
      data: {
        cvFileId: fileCreated.id,
      },
    });

    revalidatePath("/list/reclutamiento");
    revalidatePath("/reclutador/kanban");
    revalidatePath("/reclutador");

    return {
      ok: true,
      message: "CV subido exitosamente",
    };
  } catch (error) {
    console.error("Error al subir el CV:", error);
    return {
      ok: false,
      message: "Error al subir el CV",
    };
  }
};

export const deleteCvFromCandidate = async (personId: string) => {
  try {
    const candidate = await prisma.person.findUnique({
      where: { id: personId },
      include: {
        cv: true,
      },
    });

    if (candidate?.cv) {
      await deleteAnyFile(candidate.cv.url);

      //Buscar el archivo en la base de datos
      const findFile = await prisma.vacancyFile.findFirst({
        where: { personCV: { id: personId } },
      });

      //Si no existe el archivo, no se puede eliminar
      if (!findFile) {
        return {
          ok: false,
          message: "Error al eliminar el CV",
        };
      }

      //Eliminar el archivo de la base de datos
      await prisma.vacancyFile.delete({
        where: { id: findFile.id },
      });
    }
    revalidatePath("/list/reclutamiento");
    revalidatePath("/reclutador/kanban");
    revalidatePath("/reclutador");
    return {
      ok: true,
      message: "CV eliminado exitosamente",
    };
  } catch (error) {
    console.error("Error al eliminar el CV:", error);
    return {
      ok: false,
      message: "Error al eliminar el CV",
    };
  }
};

export const updateNewCvToCandidate = async (personId: string, file: File) => {
  try {
    const user = await auth();
    if (!user?.user) {
      return {
        ok: false,
        message: "Usuario no autenticado",
      };
    }
    const currentUserId = user.user.id;

    //Borrar el archivo si existe
    const candidate = await prisma.person.findUnique({
      where: { id: personId },
      include: {
        cv: true,
      },
    });

    if (candidate?.cv) {
      await deleteAnyFile(candidate.cv.url);
    }

    // subir el archivo a cloudinary
    const formData = new FormData();
    formData.append("file", file);
    const uploadedUrl = await uploadFile(formData);

    if (!uploadedUrl.ok || !uploadedUrl.url) {
      return {
        ok: false,
        message: "Error al subir el cv a cloudinary",
      };
    }

    // crear el archivo en la base de datos
    const fileCreated = await prisma.vacancyFile.create({
      data: {
        authorId: currentUserId,
        url: uploadedUrl.url,
        name: file.name,
        mimeType: file.type,
        size: file.size,
      },
    });

    // actualizar el candidato con el id del archivo
    await prisma.person.update({
      where: { id: personId },
      data: {
        cvFileId: fileCreated.id,
      },
    });

    revalidatePath("/list/reclutamiento");
    revalidatePath("/reclutador/kanban");
    revalidatePath("/reclutador");

    return {
      ok: true,
      message: "CV subido exitosamente",
    };
  } catch (error) {
    console.error("Error al subir el CV:", error);

    return {
      ok: false,
      message: "Error al subir el CV",
    };
  }
};

export const createLeadPerson = async (prevState: any, formData: FormData) => {
  try {
    await checkSession();

    const submission = parseWithZod(formData, {
      schema: createLeadPersonSchema,
    });

    if (submission.status !== "success") {
      return {
        status: "error",
        message: "Error en la validación del formulario",
        errors: submission.reply().error?.formErrors || [],
      };
    }

    // Verificar que el lead existe y pertenece al usuario correcto
    const lead = await prisma.lead.findUnique({
      where: {
        id: submission.value.leadId,
      },
      include: {
        generadorLeads: true,
      },
    });

    if (!lead) {
      return {
        status: "error",
        message: "El lead no existe",
      };
    }

    // Crear el contacto
    const contact = await prisma.person.create({
      data: {
        name: submission.value.name,
        position: submission.value.position,
        email: submission.value.email || null,
        phone: submission.value.phone || null,
        leadId: submission.value.leadId,
        linkedin: submission.value.linkedin || null,
      },
      include: {
        interactions: {
          include: {
            autor: true,
            contacto: true,
          },
        },
      },
    });

    // Revalidar las rutas necesarias
    revalidatePath("/leads");
    revalidatePath("/list/leads");

    return {
      status: "success",
      data: contact,
    };
  } catch (error) {
    console.error("Error creating contact:", error);
    return {
      status: "error",
      message: "Error al crear el contacto",
    };
  }
};

export const editLeadPerson = async (contactId: string, formData: FormData) => {
  try {
    await checkSession();

    const submission = parseWithZod(formData, {
      schema: editLeadPersonSchema,
    });

    if (submission.status !== "success") {
      return submission.reply();
    }

    const existingContact = await prisma.person.findUnique({
      where: { id: contactId },
    });

    if (!existingContact) {
      throw Error("Contacto no encontrado");
    }

    const email =
      submission.value.email === undefined ? null : submission.value.email;
    const phone =
      submission.value.phone === undefined ? null : submission.value.phone;

    await prisma.person.update({
      where: { id: contactId },
      data: {
        name: submission.value.name || existingContact.name,
        position: submission.value.position || existingContact.position,
        email,
        phone,
      },
    });

    revalidatePath("/leads");
    revalidatePath("/list/leads");
  } catch (error) {
    throw Error("Error actualizando el contacto");
  }
};

export const deleteContactById = async (contactId: string) => {
  await checkSession();

  //TODO: eliminar archivos si existen dentro del seguimiento
  try {
    const contactToDelete = await prisma.person.findUnique({
      where: {
        id: contactId,
      },
      include: {
        interactions: {
          select: {
            attachmentUrl: true,
            id: true,
          },
        },
      },
    });

    if (contactToDelete?.interactions) {
      for (const interaction of contactToDelete?.interactions) {
        if (interaction.attachmentUrl) {
          const fileKey = interaction.attachmentUrl.split("/").pop();
          if (!fileKey) {
            throw new Error(
              "No se puede generar el fileKey mientras se elimina el contacto"
            );
          }
          await deleteFile(fileKey, interaction.id);
        }
      }
    }

    await prisma.person.delete({
      where: {
        id: contactId,
      },
    });

    revalidatePath("/leads");
    revalidatePath("/list/leads");
  } catch (error) {
    console.log(error);
    return {
      ok: false,
      message: "error al eliminar el lead",
    };
  }
};
