"use server";
import { deleteAnyFile, uploadFile } from "@/actions/files/actions";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createVacancyNotification } from "../notifications/vacancies-notificactions";
import { NotificationVacancyType } from "@/types/vacancy-notifications";

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
      include: {
        jobDescriptionVacancy: true,
        perfilMuestraVacancy: true,
      },
    });

    const vacancy = await prisma.vacancy.findFirst({
      where: { id: vacancyId },
      include: {
        JobDescription: true,
      },
    });

    return {
      ok: true,
      message: "Archivos obtenidos correctamente",
      files,
      jobDescription: vacancy?.JobDescription,
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

interface JobDescriptionData {
  file: File;
  vacancyId: string;
}

export const createJobDescriptionAction = async ({
  file,
  vacancyId,
}: JobDescriptionData) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        ok: false,
        message: "No autorizado",
      };
    }

    //revisar si la vacante ya tiene job Description y eliminarlo
    const vacancy = await prisma.vacancy.findUnique({
      where: { id: vacancyId },
      include: { JobDescription: true },
    });

    //eliminar el job description si existe de la base de datos y de digital ocean
    if (vacancy?.JobDescription) {
      await deleteJobDescriptionAction(vacancyId, vacancy.JobDescription.id);
    }

    //subir el nuevo archivo a digital ocean
    const formData = new FormData();
    formData.append("file", file);
    const fileInDigitalOcean = await uploadFile(formData);

    if (!fileInDigitalOcean.ok || !fileInDigitalOcean.url) {
      return {
        ok: false,
        message: fileInDigitalOcean.message,
      };
    }

    // Crear el nuevo job description
    const jobDescriptionFile = await prisma.vacancyFile.create({
      data: {
        name: `Job Description - ${file.name}`,
        url: fileInDigitalOcean.url,
        mimeType: fileInDigitalOcean.fileType,
        size: fileInDigitalOcean.size,
        authorId: session.user.id,
        // NO usar vacancyId aquí para JobDescription
      },
    });

    // Vincular a la vacante como job description
    await prisma.vacancy.update({
      where: { id: vacancyId },
      data: {
        jobDescriptionId: jobDescriptionFile.id,
      },
    });
    //crear y mandar notificaciones a los administradores
    const { message: messageNotification, ok: okNotification } =
      await createVacancyNotification({
        vacancyId,
        type: NotificationVacancyType.JobDescription,
      });

    if (!okNotification) {
      return {
        ok: false,
        message: messageNotification,
      };
    }

    revalidatePath(`/reclutador`);
    revalidatePath(`/reclutador/kanban`);
    revalidatePath(`/list/reclutamiento`);

    return {
      ok: true,
      message: "Job Description creado exitosamente",
    };
  } catch (e) {
    console.error(e);
    return {
      ok: false,
      message: "Error al crear el JobDescription",
    };
  }
};

export const deleteJobDescriptionAction = async (
  vacancyId: string,
  fileId: string
) => {
  try {
    //eliminar el archivo de la base de datos
    const jobDescription = await prisma.vacancyFile.delete({
      where: { id: fileId },
      select: {
        name: true,
      },
    });
    //eliminar el archivo de digital ocean
    await deleteAnyFile(jobDescription.name);

    revalidatePath(`/reclutador`);
    revalidatePath(`/reclutador/kanban`);
    revalidatePath(`/list/reclutamiento`);
    return {
      ok: true,
      message: "JobDescription eliminado correctamente",
    };
  } catch (e) {
    console.error(e);
    return {
      ok: false,
      message: "Error al eliminar el JobDescription",
    };
  }
};

interface PerfilMuestraData {
  file: File;
  vacancyId: string;
  name?: string;
}

export const createPerfilMuestraAction = async ({
  file,
  vacancyId,
  name,
}: PerfilMuestraData) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        ok: false,
        message: "No autorizado",
      };
    }

    // Subir el archivo a Digital Ocean
    const formData = new FormData();
    formData.append("file", file);
    const fileInDigitalOcean = await uploadFile(formData);

    if (!fileInDigitalOcean.ok || !fileInDigitalOcean.url) {
      return {
        ok: false,
        message: fileInDigitalOcean.message,
      };
    }

    // Crear el perfil muestra
    const perfilMuestraFile = await prisma.vacancyFile.create({
      data: {
        name: name || `Perfil Muestra - ${file.name}`,
        url: fileInDigitalOcean.url,
        mimeType: fileInDigitalOcean.fileType,
        size: fileInDigitalOcean.size,
        authorId: session.user.id,
        perfilMuestraVacancyId: vacancyId, // Esta es la relación correcta para perfiles muestra
      },
    });

    //crear y mandar notificaciones a los administradores
    const { message: messageNotification, ok: okNotification } =
      await createVacancyNotification({
        vacancyId,
        type: NotificationVacancyType.PerfilMuestra,
      });

    if (!okNotification) {
      return {
        ok: false,
        message: messageNotification,
      };
    }

    revalidatePath(`/reclutador`);
    revalidatePath(`/reclutador/kanban`);
    revalidatePath(`/list/reclutamiento`);

    return {
      ok: true,
      message: "Perfil Muestra agregado exitosamente",
      file: perfilMuestraFile,
    };
  } catch (e) {
    console.error(e);
    return {
      ok: false,
      message: "Error al crear el Perfil Muestra",
    };
  }
};

export const getVacancyFilesDetailed = async (vacancyId: string) => {
  try {
    const vacancy = await prisma.vacancy.findUnique({
      where: { id: vacancyId },
      include: {
        // Archivos generales
        files: {
          include: {
            author: { select: { name: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        // Múltiples perfiles muestra
        perfilesMuestra: {
          include: {
            author: { select: { name: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        // Un solo job description
        JobDescription: {
          include: {
            author: { select: { name: true, email: true } },
          },
        },
        reclutador: { select: { name: true, email: true } },
        cliente: true,
      },
    });

    return {
      ok: true,
      vacancy,
      archivosGenerales: vacancy?.files || [],
      perfilesMuestra: vacancy?.perfilesMuestra || [],
      jobDescription: vacancy?.JobDescription || null,
      totalArchivos:
        (vacancy?.files?.length || 0) +
        (vacancy?.perfilesMuestra?.length || 0) +
        (vacancy?.JobDescription ? 1 : 0),
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
      message: "Error al obtener los archivos de la vacante",
      archivosGenerales: [],
      perfilesMuestra: [],
      jobDescription: null,
      totalArchivos: 0,
    };
  }
};
