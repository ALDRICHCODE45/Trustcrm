import { type ReactElement } from "react";
import { auth } from "@/core/lib/auth";
import { checkRoleRedirect } from "../../../helpers/checkRoleRedirect";
import { Role } from "@prisma/client";
import { Metadata } from "next";
import { RecruiterTable } from "./table/RecruiterTableOptimized";

import CreateVacanteForm from "./components/CreateVacanteForm";
import prisma from "@/core/lib/db";
import {
  reclutadorColumns,
  VacancyWithRelations,
} from "../../reclutador/components/ReclutadorColumns";
import { redirect } from "next/navigation";

export interface pageProps {}

export const metadata: Metadata = {
  title: "Trust | Reclutamiento",
};

const fetchVacancies = async (): Promise<VacancyWithRelations[]> => {
  try {
    const vacantes = await prisma.vacancy.findMany({
      include: {
        reclutador: true,
        InputChecklist: {
          include: {
            InputChecklistFeedback: {
              include: {
                candidate: true,
              },
            },
          },
        },
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
        files: true,
        Comments: {
          include: {
            author: true,
          },
        },
      },
    });
    return vacantes;
  } catch (err) {
    console.log(err);
    throw new Error("Error al devolver las vacantes");
  }
};

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

const fetchClientes = async () => {
  try {
    const clientes = await prisma.client.findMany();
    return clientes;
  } catch (err) {
    console.log(err);
    throw new Error("Error al devolver los clientes");
  }
};

export default async function ReclutamientoPage({}: pageProps): Promise<ReactElement> {
  const vacantes = await fetchVacancies();

  const session = await auth();
  if (!session?.user) {
    redirect("/sign-up");
  }

  checkRoleRedirect(session?.user.role as Role, [Role.Admin]);

  const reclutadores = await fetchReclutadores();
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
          <div className="flex flex-col gap-4">
            <CreateVacanteForm
              reclutadores={reclutadores}
              clientes={clientes}
              user_logged={user_logged}
            />
            <RecruiterTable
              columns={reclutadorColumns}
              data={vacantes}
              reclutadores={reclutadores}
              clientes={clientes}
              user_logged={user_logged}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
