"use server";
import { createLeadSchema } from "@/zod/createLeadSchema";
import prisma from "@/lib/db";
import { parseWithZod } from "@conform-to/zod";
import { checkSession } from "@/hooks/auth/checkSession";
import { editLeadZodSchema } from "@/zod/editLeadSchema";
import { revalidatePath } from "next/cache";
import { User, Role, LeadStatus } from "@prisma/client";
import { auth } from "@/lib/auth";

export const addEtiqueta = async (
  contactoId: string,
  etiqueta: LeadStatus | "none"
) => {
  try {
    const contacto = await prisma.person.findUnique({
      where: {
        id: contactoId,
      },
    });
    console.log({ contacto });

    if (!contacto) {
      return {
        ok: false,
        message: "Contacto no encontrado",
      };
    }
    if (etiqueta !== "none") {
      await prisma.person.update({
        where: {
          id: contactoId,
        },
        data: {
          etiqueta: etiqueta,
        },
      });
      revalidatePath("/leads/kanban");
      revalidatePath("/leads");
      revalidatePath("/list/leads");
      return {
        ok: true,
        message: "Etiqueta agregada correctamente",
      };
    }
    await prisma.person.update({
      where: {
        id: contactoId,
      },
      data: {
        etiqueta: undefined,
      },
    });
    revalidatePath("/leads/kanban");
    revalidatePath("/leads");
    revalidatePath("/list/leads");
    return {
      ok: true,
      message: "Etiqueta eliminada correctamente",
    };
  } catch (err) {
    return {
      ok: false,
      message: "Error al agregar la etiqueta",
    };
  }
};

export const editLeadByIdAndCreatePreClient = async (
  formData: FormData,
  leadId: string
) => {
  if (!leadId) {
    throw new Error("Lead id is required");
  }

  const numeroEmpleados = formData.get("numero_empleados") as string;
  const ubicacion = formData.get("ubicacion") as string;
  const subSectorId = formData.get("subSectorId") as string;
  const status = formData.get("status") as string;

  try {
    //Buscamos el lead
    const existingLead = await prisma.lead.findUnique({
      where: {
        id: leadId,
      },
      include: {
        origen: true,
        sector: true,
      },
    });

    console.log({ formData, existingLead });

    if (!existingLead) {
      throw Error("Lead does not exists");
    }
    // Actualizamos el lead
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        numero_empleados:
          parseInt(numeroEmpleados) || existingLead.numero_empleados,
        ubicacion: ubicacion || existingLead.ubicacion,
        subSectorId: subSectorId || existingLead.subSectorId,
        status: (status as LeadStatus) || existingLead.status,
      },
    });

    //Creamos el precliente
    //Quitamos el precliente por el momento, pero debemos corregir el nombre de la funcion
    // await prisma.client.create({
    //   data: {
    //     leadId: leadId,
    //     usuarioId: existingLead.generadorId,
    //     cuenta: existingLead.empresa,
    //     origenId: existingLead.origenId,
    //   },
    // });
  } catch (err) {
    console.log(err);
    throw new Error("Error al editar el lead y crear el precliente");
  }
};

export const createNewSector = async (formData: FormData) => {
  const session = await auth();
  if (!session) {
    throw new Error("invalid session");
  }
  const sectorName = formData.get("nombre") as string;

  if (sectorName.length < 3 || !sectorName) {
    return {
      ok: false,
      message: "Sector invalido",
    };
  }

  try {
    await prisma.leadOrigen.create({
      data: {
        nombre: sectorName,
      },
    });
    revalidatePath("/config/leads");
    return {
      ok: true,
      message: "Origen creado correctamente",
    };
  } catch (err) {
    throw new Error("invalid Origen");
  }
};

export const deleteOrigenById = async (formData: FormData) => {
  const origenId = formData.get("origenId") as string;
  if (!origenId) {
    return {
      ok: false,
      message: "Origen id is required",
    };
  }

  const origenExists = await prisma.leadOrigen.findUnique({
    where: {
      id: origenId,
    },
  });

  if (!origenExists) {
    return {
      ok: false,
      message: "El origen no existe",
    };
  }

  try {
    await prisma.leadOrigen.delete({
      where: {
        id: origenId,
      },
    });

    revalidatePath("/config/leads");
    return {
      ok: true,
      message: "Origen eliminado satisfactoriamente",
    };
  } catch (err) {
    throw new Error("Error al eliminar el origen");
  }
};

export const editOrigen = async (formData: FormData) => {
  try {
    const newName = formData.get("newName") as string;
    const origenId = formData.get("origenId") as string;

    if (!newName || !origenId) {
      return {
        ok: false,
        message: "Datos insuficientes",
      };
    }

    if (newName.length < 3) {
      return {
        ok: false,
        message: "El nombre debe contener al menos 3 caracteres",
      };
    }

    const origenExists = await prisma.leadOrigen.findUnique({
      where: {
        id: origenId,
      },
    });

    if (!origenExists) {
      return {
        ok: false,
        message: "Origen does not exists",
      };
    }

    await prisma.leadOrigen.update({
      where: {
        id: origenId,
      },
      data: {
        nombre: newName,
      },
    });
    revalidatePath("/config/leads");

    return {
      ok: true,
      message: "Origen actualizado correctamente",
    };
  } catch (err) {
    throw new Error("Erorr al editar el origen");
  }
};

export const createNewOrigen = async (formData: FormData) => {
  const session = await auth();
  if (!session) {
    throw new Error("invalid session");
  }
  const origenName = formData.get("nombre") as string;

  if (origenName.length < 3 || !origenName) {
    return {
      ok: false,
      message: "Origen invalido",
    };
  }

  try {
    await prisma.leadOrigen.create({
      data: {
        nombre: origenName,
      },
    });
    revalidatePath("/config/leads");
    return {
      ok: true,
      message: "Origen creado correctamente",
    };
  } catch (err) {
    throw new Error("invalid Origen");
  }
};

export const deleteLeadById = async (leadId: string) => {
  const session = await auth();

  try {
    const leadIndb = await prisma.lead.findUnique({
      where: {
        id: leadId,
      },
    });

    if (!leadIndb) {
      throw new Error("El lead no existe");
    }

    await prisma.lead.delete({
      where: {
        id: leadId,
      },
    });
  } catch (error) {
    console.log(error);
    throw Error("Error al eliminar el lead");
  }
  revalidatePath("/leads");
};

export const getRecruiters = async (): Promise<User[]> => {
  try {
    const recruiters = await prisma.user.findMany({
      where: {
        role: {
          in: [Role.GL, Role.Admin, Role.MK],
        },
      },
    });
    return recruiters;
  } catch (error) {
    console.log(error);
    throw Error("error");
  }
};

export async function createLead(prevState: any, formData: FormData) {
  let submission;
  try {
    await checkSession();
    submission = parseWithZod(formData, {
      schema: createLeadSchema,
    });
    if (submission.status !== "success") {
      return submission.reply();
    }
    const empresa = submission.value.empresa.trim();

    // Check if lead already exists (exact match, case insensitive)
    const leadExists = await prisma.lead.findFirst({
      where: {
        empresa: {
          equals: empresa,
          mode: "insensitive",
        },
      },
    });

    // Return custom error for duplicate lead
    if (leadExists) {
      return submission.reply({
        formErrors: [
          `La empresa "${empresa}" ya existe como lead en el sistema`,
        ],
      });
    }
    const origen = await prisma.leadOrigen.findUnique({
      where: {
        id: submission.value.origen,
      },
    });
    const sector = await prisma.sector.findUnique({
      where: {
        id: submission.value.sector,
      },
    });
    // Create the new lead
    const leadCreated = await prisma.lead.create({
      data: {
        empresa: submission.value.empresa,
        link: submission.value.link,
        origenId: origen!.id,
        sectorId: sector!.id,
        status: submission.value.status,
        generadorId: submission.value.generadorId,
        createdAt: submission.value.createdAt,
      },
      include: {
        generadorLeads: true,
        contactos: true,
        sector: true,
        origen: true,
      },
    });
    //crear la trazabilidad para Contacto
    await prisma.leadStatusHistory.create({
      data: {
        leadId: leadCreated.id,
        status: leadCreated.status,
        changedById: submission.value.generadorId,
      },
    });
    //Revalidate necessary paths
    revalidatePath("/leads");
    revalidatePath("/list/leads");
    revalidatePath("/leads/kanban");
    // Return success with the newly created lead data
    return submission.reply();
  } catch (error) {
    console.error("Error creating lead:", error);
    return (
      submission?.reply({
        formErrors: ["Error en la creacion del Lead"],
      }) || {
        status: "error",
        formErrors: ["Error en la creacion del Lead"],
      }
    );
  }
}

export const editLeadById = async (leadId: string, formData: FormData) => {
  const sesion = await checkSession();

  try {
    const submission = parseWithZod(formData, {
      schema: editLeadZodSchema,
    });

    if (submission.status !== "success") {
      return submission.reply();
    }

    const existingLead = await prisma.lead.findUnique({
      where: {
        id: leadId,
      },
      include: {
        origen: true,
        sector: true,
        generadorLeads: true,
      },
    });

    if (!existingLead) {
      throw Error("Lead does not exists");
    }

    // Modificado: Si NO es admin Y además no es el creador del lead, entonces no puede modificarlo
    // if (
    //   sesion.user.role !== Role.Admin &&
    //   sesion.user.id !== existingLead.generadorId
    // ) {
    //   throw new Error("No puedes modificar este lead");
    // }

    // Verificamos si el status está cambiando
    const newStatus = submission.value.status;
    const statusChanged = newStatus && newStatus !== existingLead.status;

    // Convertir numero_empleados de string a number si está presente
    let numeroEmpleados = existingLead.numero_empleados;
    if (submission.value.numero_empleados) {
      // Extraer solo los números del string "1-10" -> 10, "11-50" -> 50, etc.
      const match = submission.value.numero_empleados.match(/(\d+)[-+]/);
      if (match) {
        numeroEmpleados = parseInt(match[1]);
      } else if (submission.value.numero_empleados === "500+") {
        numeroEmpleados = 500;
      }
    }

    // Actualizamos el lead
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        empresa: submission.value.empresa || existingLead.empresa,
        generadorId: submission.value.generadorId || existingLead.generadorId,
        link: submission.value.link || existingLead.link,
        origenId: submission.value.origen || existingLead.origenId,
        sectorId: submission.value.sector || existingLead.sectorId,
        status: submission.value.status || existingLead.status,
        numero_empleados: numeroEmpleados,
        ubicacion: submission.value.ubicacion || existingLead.ubicacion,
        subSectorId: submission.value.subSectorId || existingLead.subSectorId,
      },
    });

    // Si el estado cambió, registramos en el historial
    if (statusChanged) {
      await prisma.leadStatusHistory.create({
        data: {
          leadId: leadId,
          status: newStatus,
          changedById: sesion.user.id,
          // La fecha se establecerá automáticamente con @default(now())
        },
      });
    }

    const clientName = updatedLead.empresa;

    //verificamos si el estado cambio a Asignadas y creamos/actualizamos el precliente
    if (newStatus === LeadStatus.Asignadas) {
      // Verificar si ya existe un cliente para este lead
      const existingClient = await prisma.client.findFirst({
        where: {
          leadId: leadId,
        },
      });

      if (existingClient) {
        return;
      } else {
        // Si no existe, creamos uno nuevo
        const clienteCreated = await prisma.client.create({
          data: {
            leadId: leadId,
            usuarioId: existingLead.generadorId,
            cuenta: clientName,
            origenId: updatedLead.origenId,
          },
        });

        console.log({ updatedLead, clienteCreated });
      }
    }

    revalidatePath("/leads");
    revalidatePath("/list/leads");
  } catch (err) {
    console.log(err);
    throw new Error("Error al editar el lead");
  }
};
