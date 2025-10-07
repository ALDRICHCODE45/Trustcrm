import { type ReactElement } from "react";
import { RecruiterTable } from "../list/reclutamiento/table/RecruiterTableOptimized";
import {
  reclutadorColumns,
  VacancyWithRelations,
} from "./components/ReclutadorColumns";
import { ToastAlerts } from "@/components/ToastAlerts";
import { checkRoleRedirect } from "../../helpers/checkRoleRedirect";
import { auth } from "@/core/lib/auth";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import prisma from "@/core/lib/db";

export interface PageProps {}
const fetchReclutadores = async () => {
  try {
    const reclutadores = await prisma.user.findMany({
      where: {
        role: Role.reclutador,
      },
    });
    return reclutadores;
  } catch (err) {
    console.log(err);
    throw new Error("Error al devolver los reclutadores");
  }
};

const fetchVacancies = async (): Promise<VacancyWithRelations[]> => {
  try {
    const vacantes = await prisma.vacancy.findMany({
      include: {
        InputChecklist: {
          include: {
            InputChecklistFeedback: {
              include: {
                candidate: true,
              },
            },
          },
        },
        reclutador: true,
        cliente: true,
        candidatoContratado: {
          include: {
            cv: true,
            vacanciesContratado: true,
          },
        },
        ternaFinal: {
          include: {
            cv: true,
            vacanciesContratado: true,
          },
        },
        Comments: {
          include: {
            author: true,
          },
        },
        files: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
    return vacantes;
  } catch (err) {
    console.log(err);
    throw new Error("Error al devolver las vacantes");
  }
};

const fetchClientes = async () => {
  try {
    const clientes = await prisma.client.findMany();
    return clientes;
  } catch (err) {
    console.log(err);
    throw new Error("Error al devolver los clientes");
  }
};

export default async function VacantesPage({}: PageProps): Promise<ReactElement> {
  const session = await auth();
  if (!session) {
    redirect("sign/in");
  }
  checkRoleRedirect(session?.user.role as Role, [Role.Admin, Role.reclutador]);

  const reclutadores = await fetchReclutadores();
  const vacantes = await fetchVacancies();
  const clientes = await fetchClientes();
  const user_logged = {
    id: session?.user.id,
    name: session?.user.name,
    role: session?.user.role,
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 gap-6">
        <div className="col-span-1">
          {/* LIST */}
          <ToastAlerts />

          <RecruiterTable
            columns={reclutadorColumns}
            clientes={clientes}
            data={vacantes}
            reclutadores={reclutadores}
            user_logged={user_logged}
          />
        </div>
      </div>
    </div>
  );
}
