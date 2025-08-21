"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { CreateCandidateFormData } from "@/zod/createCandidateSchema";
import { uploadFile } from "../files/actions";
import { FileMetadata } from "@/hooks/use-file-upload";
import { revalidatePath } from "next/cache";

export async function createCandidate(
  data: CreateCandidateFormData & { cvFile?: File | FileMetadata | undefined },
  vacancyId: string
) {
  try {
    const user = await auth();
    if (!user?.user) {
      return {
        ok: false,
        message: "Usuario no autenticado",
      };
    }
    const currentUserId = user.user.id;

    if (data.cvFile) {
      // 1. Subir archivo a storage (S3, Cloudinary, etc.)
      const formData = new FormData();
      formData.append("file", data.cvFile);
      const uploadedUrl = await uploadFile(formData);

      if (!uploadedUrl.ok || !uploadedUrl.url) {
        return {
          ok: false,
          message: "Error al subir el archivo",
        };
      }
      // 2. Crear VacancyFile con los datos del archivo,
      // No se necesita vacancyId porque solo queremos que el documento
      // aparezca en el person no el documentos de la vacante
      const vacancyFile = await prisma.vacancyFile.create({
        data: {
          url: uploadedUrl.url!,
          name: data.cvFile.name,
          mimeType: data.cvFile.type,
          size: data.cvFile.size,
          authorId: currentUserId,
        },
      });
      // 3. Crear Person con cvFileId
      const person = await prisma.person.create({
        data: {
          name: data.name,
          email: data.email || undefined,
          phone: data.phone || undefined,
          cvFileId: vacancyFile.id,
          //datos extra del candidato
          esta_empleado: data.esta_empleado || false,
          sueldo_actual_o_ultimo: data.sueldo_actual_o_ultimo || undefined,
          prestaciones_actuales_o_ultimas:
            data.prestaciones_actuales_o_ultimas || undefined,
          bonos_comisiones: data.bonos_comisiones || undefined,
          otros_beneficios: data.otros_beneficios || undefined,
          expectativa_económica: data.expectativa_económica || undefined,
          direccion_actual: data.direccion_actual || undefined,
          modalidad_actual_o_ultima:
            data.modalidad_actual_o_ultima || undefined,
          ubicacion_ultimo_trabajo: data.ubicacion_ultimo_trabajo || undefined,
          empresa_actual_o_ultima: data.empresa_actual_o_ultima || undefined,
          vacanciesTernaFinal: {
            connect: {
              id: vacancyId,
            },
          },
        },
        include: {
          cv: true,
        },
      });
      return {
        ok: true,
        message: "Candidato creado exitosamente",
        person,
      };
    } else {
      // Crear Person sin CV
      const person = await prisma.person.create({
        data: {
          name: data.name,
          email: data.email || undefined,
          phone: data.phone || undefined,
          //datos extra del candidato
          esta_empleado: data.esta_empleado || false,
          sueldo_actual_o_ultimo: data.sueldo_actual_o_ultimo || undefined,
          prestaciones_actuales_o_ultimas:
            data.prestaciones_actuales_o_ultimas || undefined,
          bonos_comisiones: data.bonos_comisiones || undefined,
          otros_beneficios: data.otros_beneficios || undefined,
          expectativa_económica: data.expectativa_económica || undefined,
          direccion_actual: data.direccion_actual || undefined,
          modalidad_actual_o_ultima:
            data.modalidad_actual_o_ultima || undefined,
          ubicacion_ultimo_trabajo: data.ubicacion_ultimo_trabajo || undefined,
          empresa_actual_o_ultima: data.empresa_actual_o_ultima || undefined,
          vacanciesTernaFinal: {
            connect: {
              id: vacancyId,
            },
          },
        },
        include: {
          cv: true,
        },
      });

      return {
        ok: true,
        message: "Candidato creado exitosamente sin CV",
        person,
      };
    }
  } catch (error) {
    console.error("Error al crear candidato:", error);
    throw new Error("Error al crear candidato para la vacante");
  }
}

export async function deleteCandidate(candidateId: string) {
  try {
    await prisma.person.delete({
      where: { id: candidateId },
    });
    revalidatePath("/list/reclutamiento");
    revalidatePath("/reclutador/kanban");
    revalidatePath("/reclutador");
    return {
      ok: true,
      message: "Candidato eliminado exitosamente",
    };
  } catch (error) {
    console.error("Error al eliminar candidato:", error);
    return {
      ok: false,
      message: "Error al eliminar candidato",
    };
  }
}

export const updateCandidate = async (
  candidateId: string,
  data: CreateCandidateFormData
) => {
  try {
    const user = await auth();
    if (!user?.user) {
      return {
        ok: false,
        message: "Usuario no autenticado",
      };
    }

    // TODO: Implementar la lógica para actualizar el candidato
    const person = await prisma.person.update({
      where: { id: candidateId },
      data: {
        name: data.name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        esta_empleado: data.esta_empleado || false,
        sueldo_actual_o_ultimo: data.sueldo_actual_o_ultimo || undefined,
        prestaciones_actuales_o_ultimas:
          data.prestaciones_actuales_o_ultimas || undefined,
        bonos_comisiones: data.bonos_comisiones || undefined,
        otros_beneficios: data.otros_beneficios || undefined,
        expectativa_económica: data.expectativa_económica || undefined,
        direccion_actual: data.direccion_actual || undefined,
        modalidad_actual_o_ultima: data.modalidad_actual_o_ultima || undefined,
        ubicacion_ultimo_trabajo: data.ubicacion_ultimo_trabajo || undefined,
        empresa_actual_o_ultima: data.empresa_actual_o_ultima || undefined,
      },
    });

    revalidatePath("/list/reclutamiento");
    revalidatePath("/reclutador/kanban");
    revalidatePath("/reclutador");
    return {
      ok: true,
      message: "Candidato actualizado exitosamente",
      person,
    };
  } catch (error) {
    console.error("Error al actualizar candidato:", error);
    return {
      ok: false,
      message: "Error al actualizar candidato",
    };
  }
};
