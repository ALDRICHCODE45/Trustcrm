"use server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

interface addCandidateFeedbackProps {
  requisitoId: string;
  candidate_feedback: string;
}

export const addCandidateFeedback = async (
  props: addCandidateFeedbackProps[],
) => {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    for (const { candidate_feedback, requisitoId } of props) {
      await prisma.inputChecklist.update({
        where: { id: requisitoId },
        data: { candidate_feedback },
      });
    }

    revalidatePath(`/reclutador/kanban`);
    revalidatePath(`/list/reclutamiento`);
    return {
      ok: true,
      message: "Feedback del candidato agregado correctamente",
    };
  } catch (er) {
    return {
      ok: false,
      message: "Error al agregar el feedback del candidato",
    };
  }
};
export const createChecklist = async (
  vacancyId: string,
  inputsChecklist: string[],
) => {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    //buscar la vacante
    const vacancy = await prisma.vacancy.findUnique({
      where: {
        id: vacancyId,
      },
    });

    if (!vacancy) {
      throw new Error("Vacante no encontrada");
    }

    //crear el checklist para la vacante
    for (const input of inputsChecklist) {
      await prisma.inputChecklist.create({
        data: {
          content: input,
          vacancyId: vacancy.id,
        },
      });
    }

    revalidatePath(`/reclutador/kanban`);
    revalidatePath(`/list/reclutamiento`);
    revalidatePath(`/reclutamiento`);
    return {
      ok: true,
      message: "Checklist creado correctamente",
    };
  } catch (error) {
    return {
      ok: false,
      message: "Error al crear el checklist",
    };
  }
};

//Eliminar requisito
export const deleteChecklist = async (id: string) => {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    //buscar el requisito
    const requisito = await prisma.inputChecklist.findUnique({
      where: {
        id,
      },
    });
    if (!requisito) {
      throw new Error("Requisito no encontrado");
    }
    //eliminar el requisito
    await prisma.inputChecklist.delete({
      where: { id },
    });

    revalidatePath(`/reclutador/kanban`);
    revalidatePath(`/list/reclutamiento`);
    revalidatePath(`/reclutamiento`);

    return {
      ok: true,
      message: "Requisito eliminado correctamente",
    };
  } catch (error) {
    return {
      ok: false,
      message: "Error al eliminar el requisito",
    };
  }
};

//Validar checklist
export const ValidateChecklist = async (vacancyId: string) => {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    //Todo: implementar la logica para validar el checklist
  } catch (error) {}
};
