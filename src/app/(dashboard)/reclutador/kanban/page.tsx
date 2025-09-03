"use client";
import { KanbanBoardPage } from "../components/kanbanReclutadorBoard";
import { Role } from "@prisma/client";
import QuickStatsDialog from "../components/QuickStatsDialog";
import CreateVacanteForm from "../../list/reclutamiento/components/CreateVacanteForm";
import { useVacancyDetails } from "@/hooks/vacancy/use-vacancies";
import { useClients } from "@/hooks/clientes/use-clients";
import { useEffect, useState } from "react";
import { useUsers } from "@/hooks/users/use-users";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  // Estado para controlar la visibilidad de los componentes superiores
  const [showTopComponents, setShowTopComponents] = useState(true);

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

  const user_logged_data_form = {
    id: loggedUser?.id || "",
    name: loggedUser?.name || "",
    email: loggedUser?.email || "",
    role: loggedUser?.role as Role,
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

  const toggleTopComponents = () => {
    setShowTopComponents(!showTopComponents);
  };

  return (
    <>
      <div className="flex justify-between items-center mt-2 mb-4 w-full">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleTopComponents}
          className="flex items-center gap-2"
        >
          {showTopComponents ? (
            <>
              <EyeOff className="h-4 w-4" />
              Ocultar controles
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              Mostrar controles
            </>
          )}
        </Button>

        {showTopComponents && (
          <div className="flex gap-2">
            <QuickStatsDialog />
            <CreateVacanteForm
              clientes={clients}
              reclutadores={reclutadores}
              user_logged={user_logged_data_form}
              onVacancyCreated={handleVacancyCreated}
            />
          </div>
        )}
      </div>

      <KanbanBoardPage
        initialVacantes={vacancies}
        user_logged={user_logged_data}
        reclutadores={reclutadores}
        clientes={clients}
        refreshVacancies={fetchAllVacancies}
      />
    </>
  );
}
