"use server";
import { deleteAnyFile, uploadFile } from "@/actions/files/actions";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

interface AddFileToVacancyArgs {
  name: string;
  file: File;
  authorId: string;
  vacancyId: string;
}

export const getVacancyFiles = async (vacancyId: string) => {
  try {
    const files = await prisma.vacancyFile.findMany({
      where: { vacancyId },
      orderBy: { createdAt: "desc" },
    });

    return {
      ok: true,
      message: "Archivos obtenidos correctamente",
      files,
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
      message: "Error al obtener los archivos",
      files: [],
    };
  }
};

export const addFileToVacancy = async ({
  authorId,
  file,
  name,
  vacancyId,
}: AddFileToVacancyArgs) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const fileInDigitalOcean = await uploadFile(formData);

    if (!fileInDigitalOcean.ok || !fileInDigitalOcean.url) {
      return {
        ok: false,
        message: fileInDigitalOcean.message,
      };
    }

    const fileInDb = await prisma.vacancyFile.create({
      data: {
        name,
        url: fileInDigitalOcean.url,
        mimeType: fileInDigitalOcean.fileType,
        size: fileInDigitalOcean.size,
        authorId,
        vacancyId,
      },
      select: {
        id: true,
        name: true,
        url: true,
        mimeType: true,
        size: true,
        authorId: true,
        vacancyId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    revalidatePath(`/reclutador`);
    revalidatePath(`/reclutador/kanban`);
    revalidatePath(`/list/reclutamiento`);
    return {
      ok: true,
      message: "Documento subido exitosamente",
      file: fileInDb,
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
      message: "Error al subir el archivo",
    };
  }
};

export const deleteFileFromVacancy = async (fileId: string) => {
  try {
    const file = await prisma.vacancyFile.delete({
      where: { id: fileId },
    });

    await deleteAnyFile(file.url);
    revalidatePath(`/reclutador`);
    revalidatePath(`/reclutador/kanban`);
    revalidatePath(`/list/reclutamiento`);
    return {
      ok: true,
      message: "Archivo eliminado correctamente",
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
      message: "Error al eliminar el archivo",
    };
  }
};
