"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { editClientSchema, EditClientFormData } from "@/zod/editClientSchema";
import { CreateClientFormData } from "@/zod/createClientSchema";
import { Client } from "@prisma/client";

export const createClientFromClientForm = async (
  data: CreateClientFormData
) => {
  try {
    const client = await prisma.client.create({
      data: {
        usuarioId: data.usuarioId,
        cuenta: data.cuenta,
        origenId: data.origenId,
        etiqueta: data.etiqueta,
        asignadas: data.asignadas,
        perdidas: data.perdidas,
        canceladas: data.canceladas,
        placements: data.placements,
        tp_placement: data.tp_placement,
        modalidad: data.modalidad,
        fee: data.fee,
        dias_credito: data.dias_credito,
        tipo_factura: data.tipo_factura,
        razon_social: data.razon_social,
        rfc: data.rfc,
        regimen: data.regimen,
        codigo_postal: data.codigo_postal,
        como_factura: data.como_factura,
        portal_site: data.portal_site,
      },
    });
    revalidatePath("/list/clientes");
  } catch (error) {
    console.error("Error al crear cliente:", error);
  }
};

export const deleteClientByid = async (id: string) => {
  try {
    await prisma.client.delete({
      where: { id },
    });

    revalidatePath("/list/clientes");
    revalidatePath(`/cliente/${id}`);
  } catch (error) {
    throw new Error("Error al eliminar el cliente");
  }
};

export const updateClientById = async (data: EditClientFormData) => {
  try {
    // Validar los datos con el schema de Zod
    const validatedData = editClientSchema.parse(data);

    // Extraer el ID y los datos a actualizar
    const { id, ...updateData } = validatedData;

    // Actualizar el cliente en la base de datos
    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        ...updateData,
        // Convertir modalidad string a enum si existe
        modalidad: updateData.modalidad as any,
        // Convertir etiqueta string a enum si existe
        etiqueta: updateData.etiqueta as any,
      },
    });

    revalidatePath("/list/clientes");
    revalidatePath(`/cliente/${id}`);

    return updatedClient;
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    throw new Error("Error al actualizar el cliente");
  }
};

export const getClients = async (): Promise<{
  ok: boolean;
  message: string;
  clients: Client[];
}> => {
  try {
    const clients = await prisma.client.findMany();
    return {
      ok: true,
      message: "Clientes obtenidos correctamente",
      clients,
    };
  } catch (error) {
    return {
      ok: false,
      message: "Error al obtener los clientes",
      clients: [],
    };
  }
};
