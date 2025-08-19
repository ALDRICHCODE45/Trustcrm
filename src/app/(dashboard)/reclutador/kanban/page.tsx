import prisma from "@/lib/db";
import { KanbanBoardPage } from "../components/kanbanReclutadorBoard";
import { VacancyWithRelations } from "../components/ReclutadorColumns";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import QuickStatsDialog from "../components/QuickStatsDialog";
import CreateVacanteForm from "../../list/reclutamiento/components/CreateVacanteForm";

const fetchVacancies = async (): Promise<VacancyWithRelations[]> => {
  const vacancies = await prisma.vacancy.findMany({
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
      Comments: {
        include: {
          author: true,
        },
      },
      candidatoContratado: {
        include: {
          cv: true,
          vacanciesContratado: true,
        },
      },
      reclutador: true,
      cliente: true,
      ternaFinal: {
        include: {
          cv: true,
          vacanciesContratado: true,
        },
      },
      files: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
  return vacancies;
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

export default async function KanbanReclutadorPage() {
  const [vacancies, reclutadores, clientes] = await Promise.all([
    fetchVacancies(),
    fetchReclutadores(),
    fetchClientes(),
  ]);

  const user_logged = await auth();
  if (!user_logged?.user) {
    redirect("/");
  }

  const user_logged_data = {
    name: user_logged.user.name,
    email: user_logged.user.email,
    role: user_logged.user.role as Role,
    image: user_logged.user.image || "",
  };

  const user_logged_data_form = {
    id: user_logged.user.id,
    name: user_logged.user.name,
    email: user_logged.user.email,
    role: user_logged.user.role as Role,
  };

  return (
    <>
      <div className="flex justify-end mt-2 mb-4 w-full gap-2">
        <QuickStatsDialog />
        <CreateVacanteForm
          clientes={clientes}
          reclutadores={reclutadores}
          user_logged={user_logged_data_form}
        />
      </div>
      <KanbanBoardPage
        initialVacantes={vacancies}
        user_logged={user_logged_data}
        reclutadores={reclutadores}
        clientes={clientes}
      />
    </>
  );
}
