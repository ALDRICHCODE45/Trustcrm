"use client";
import { KanbanBoardPage } from "../components/kanbanReclutadorBoard";
import { Role } from "@prisma/client";
import { useVacancyDetails } from "@/hooks/vacancy/use-vacancies";
import { useClients } from "@/hooks/clientes/use-clients";
import { useEffect, useState } from "react";
import { useUsers } from "@/hooks/users/use-users";
import { Loader2 } from "lucide-react";

export default function KanbanReclutadorPage() {
  //hook para vacantes
  const {
    fetchAllVacancies,
    vacancies,
    isLoading: isLoadingVacancies,
  } = useVacancyDetails();
  //hook para clientes
  const {
    fetchAllClients,
    clients,
    isLoading: isLoadingClients,
  } = useClients();
  //hook para reclutadores
  const {
    fetchReclutadores,
    users: reclutadores,
    fetchLoggedUser,
    loggedUser,
    isLoading: isLoadingReclutadores,
  } = useUsers();

  useEffect(() => {
    fetchAllVacancies();
    fetchAllClients();
    fetchReclutadores();
    fetchLoggedUser();
  }, []);

  const user_logged_data = {
    name: loggedUser?.name || "",
    email: loggedUser?.email || "",
    role: loggedUser?.role as Role,
    image: loggedUser?.image || "",
    id: loggedUser?.id || "",
  };

  if (
    isLoadingVacancies ||
    isLoadingReclutadores ||
    !loggedUser ||
    isLoadingClients
  ) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] w-full">
        <Loader2 className="animate-spin w-16 h-16 text-gray-600  dark:text-white mb-4" />
        <span className="text-lg text-slate-600 dark:text-slate-300 font-medium">
          Cargando información, por favor espera...
        </span>
      </div>
    );
  }

  const handleVacancyCreated = async () => {
    await fetchAllVacancies();
  };

  return (
    <KanbanBoardPage
      initialVacantes={vacancies}
      user_logged={user_logged_data}
      reclutadores={reclutadores}
      clientes={clients}
      refreshVacancies={fetchAllVacancies}
      onVacancyCreated={handleVacancyCreated}
    />
  );
}
