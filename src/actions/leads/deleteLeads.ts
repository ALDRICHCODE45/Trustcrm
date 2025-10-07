"use server";
import prisma from "@/core/lib/db";
import { revalidatePath } from "next/cache";
import { checkSession } from "@/hooks/auth/checkSession";

export const deleteMayLeads = async (ids: string[]) => {
  await checkSession();
  if (!ids) return;

  try {
    const leads = await prisma.lead.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
    revalidatePath("/list/leads"); // o la ruta que estés usando
    revalidatePath("/leads"); // o la ruta que estés usando
  } catch (error) {
    throw new Error("erorr eliminando muchos leads");
  }
};
