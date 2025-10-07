"use server";
import { Attachment } from "@/app/(dashboard)/leads/components/ContactCard";
import { auth } from "@/core/lib/auth";
import prisma from "@/core/lib/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { deleteFile } from "../files/actions";

// Importar el tipo TaskWithUsers
export type TaskWithUsers = Prisma.TaskGetPayload<{
  include: {
    assignedTo: true;
    notificationRecipients: true;
    linkedInteraction: {
      include: {
        contacto: true;
      };
    };
  };
}>;

export type ContactInteractionWithRelations =
  Prisma.ContactInteractionGetPayload<{
    include: {
      autor: true;
      contacto: true;
      linkedTasks: true;
    };
  }>;

export const deleteInteractionById = async (interactionId: string) => {
  try {
    if (!interactionId || interactionId.length < 3) {
      throw new Error("El id de la interaccion es necesario");
    }

    const fileToDelete = await prisma.contactInteraction.delete({
      where: {
        id: interactionId,
      },
      select: {
        attachmentUrl: true,
      },
    });
    console.log({ fileToDelete });
    //TODO: al eliminar la interaccion, se deben eliminar tambien los archivos de digital ocean
    if (fileToDelete.attachmentUrl) {
      const fileKey = fileToDelete.attachmentUrl.split("/").pop();
      if (!fileKey) {
        throw new Error(
          "Error al obtener el fileKey en deleteInteraccionById action"
        );
      }
      const fileDeleted = await deleteFile(fileKey, interactionId);
    }

    return { ok: true };
  } catch (err) {
    throw new Error("Error al eliminar la interaccion");
  }
};

export const editInteractionById = async (
  interactionId: string,
  formData: FormData
) => {
  // 1. Validación y limpieza de datos
  const content = formData.get("content")?.toString().trim();
  const rawAttachment = formData.get("attachment");
  const removeAttachment = formData.get("removeAttachment");

  if (!content || content.length === 0) {
    throw new Error("El contenido no puede estar vacío");
  }

  try {
    // Preparar los datos de actualización
    const updateData: any = {
      content,
      updatedAt: new Date(),
    };

    // Manejar attachment si existe
    if (
      rawAttachment &&
      typeof rawAttachment === "string" &&
      rawAttachment !== ""
    ) {
      try {
        const attachment = JSON.parse(rawAttachment) as Attachment;
        updateData.attachmentUrl = attachment.attachmentUrl;
        updateData.attachmentName = attachment.attachmentName;
        updateData.attachmentType = attachment.attachmentType;
      } catch (error) {
        console.error("Error parsing attachment JSON:", error);
      }
    }

    // Manejar eliminación de attachment
    if (removeAttachment === "true") {
      updateData.attachmentUrl = null;
      updateData.attachmentName = null;
      updateData.attachmentType = null;
    }

    // 3. Verificar existencia y actualizar en una sola operación
    const updatedInteraction = await prisma.contactInteraction.update({
      where: {
        id: interactionId,
      },
      data: updateData,
      include: {
        contacto: true,
        autor: true,
      },
    });

    return updatedInteraction;
  } catch (err) {
    console.error("Error editing interaction:", err);
    // 4. Manejo de errores más específico
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        throw new Error("Interacción no encontrada");
      }
      throw new Error("Error de base de datos");
    }
    throw new Error("Error al actualizar la interacción");
  }
};

export const createInteraction = async (
  formData: FormData
): Promise<ContactInteractionWithRelations> => {
  const content = formData.get("content") as string;
  const contactoId = formData.get("contactoId") as string;
  const rawAttachment = formData.get("attachment");

  const session = await auth();
  if (!session) {
    throw new Error("No se pudo crear la interaction");
  }

  // Datos opcionales del archivo
  let attachmentUrl: string | undefined;
  let attachmentName: string | undefined;
  let attachmentType: string | undefined;

  // Solo si el campo existe y no es una cadena vacía
  if (
    rawAttachment &&
    typeof rawAttachment === "string" &&
    rawAttachment !== ""
  ) {
    try {
      const attachment = JSON.parse(rawAttachment) as Attachment;
      attachmentUrl = attachment.attachmentUrl;
      attachmentName = attachment.attachmentName;
      attachmentType = attachment.attachmentType;
    } catch (error) {
      console.error("Error parsing attachment JSON:", error);
    }
  }

  try {
    const interaction = await prisma.contactInteraction.create({
      data: {
        content,
        contactoId,
        autorId: session.user.id,
        attachmentUrl,
        attachmentName,
        attachmentType,
      },
      include: {
        autor: true,
        contacto: true,
        linkedTasks: true,
      },
    });

    revalidatePath("/list/leads");
    revalidatePath("/leads");

    return interaction;
  } catch (err) {
    console.error(err);
    throw new Error("No se puede crear la interaccion");
  }
};

export const getAllContactInteractionsByContactId = async (
  contactId: string
): Promise<ContactInteractionWithRelations[]> => {
  try {
    const result = await prisma.contactInteraction.findMany({
      where: {
        contactoId: contactId,
      },
      include: {
        contacto: true,
        autor: true,
        linkedTasks: true,
      },
    });

    return result;
  } catch (err) {
    throw new Error("Error al obtener las interacciones");
  }
};

// Nueva función para obtener todas las interacciones de un lead
export const getAllInteractionsByLeadId = async (
  leadId: string
): Promise<ContactInteractionWithRelations[]> => {
  try {
    const session = await auth();

    if (!session) {
      throw new Error("No autorizado");
    }

    // Verificar que el lead existe y obtener información básica
    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
      },
      include: {
        generadorLeads: true,
      },
    });

    if (!lead) {
      throw new Error("Lead no encontrado");
    }

    // Obtener todas las interacciones de los contactos de este lead
    const result = await prisma.contactInteraction.findMany({
      where: {
        contacto: {
          leadId: leadId,
        },
      },
      include: {
        contacto: true,
        autor: true,
        linkedTasks: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return result;
  } catch (err) {
    console.error("Error en getAllInteractionsByLeadId:", err);
    throw new Error(
      err instanceof Error
        ? err.message
        : "Error al obtener las interacciones del lead"
    );
  }
};

// Nueva función para obtener contactos de un lead con sus interacciones
export const getContactosByLeadId = async (leadId: string) => {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("No autorizado");
    }

    // Verificar que el lead existe y obtener información básica
    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
      },
    });

    if (!lead) {
      throw new Error("Lead no encontrado");
    }

    // Obtener información del usuario actual con su rol
    const currentUser = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!currentUser) {
      throw new Error("Usuario no encontrado");
    }

    // Verificación de permisos - el generador del lead o un Admin pueden acceder
    const isLeadOwner = lead.generadorId === session.user.id;
    const isAdmin = currentUser.role === "Admin";

    if (!isLeadOwner && !isAdmin) {
      throw new Error("Lead no encontrado o sin permisos");
    }

    const contactos = await prisma.person.findMany({
      where: {
        leadId: leadId,
      },
      include: {
        interactions: {
          include: {
            autor: true,
            contacto: true,
            linkedTasks: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return contactos;
  } catch (err) {
    console.error("Error al obtener contactos:", err);
    throw new Error("Error al obtener los contactos del lead");
  }
};

// Nueva función para obtener las tareas vinculadas a una interacción
export const getTasksByInteractionId = async (
  interactionId: string
): Promise<TaskWithUsers[]> => {
  try {
    const session = await auth();

    if (!session) {
      throw new Error("No autorizado");
    }

    const tasks = await prisma.task.findMany({
      where: {
        interactionId: interactionId,
      },
      include: {
        assignedTo: true,
        notificationRecipients: true,
        linkedInteraction: {
          include: {
            contacto: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return tasks;
  } catch (err) {
    console.error("Error en getTasksByInteractionId:", err);
    throw new Error(
      err instanceof Error
        ? err.message
        : "Error al obtener las tareas de la interacción"
    );
  }
};
