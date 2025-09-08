"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@prisma/client";
import { Row } from "@tanstack/react-table";
import { getRecruiters } from "@/actions/vacantes/actions";
import { toast } from "sonner";
import { ExternalLink, Loader2, User as UserIcon } from "lucide-react";
import { VacancyWithRelations } from "@/app/(dashboard)/reclutador/components/ReclutadorColumns";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ToastCustomMessage } from "@/components/ToastCustomMessage";

export const RecruiterDropDown = ({
  row,
}: {
  row: Row<VacancyWithRelations>;
}) => {
  const [recruiters, setRecruiters] = useState<User[] | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const currentRecruiterId = row.original.reclutadorId;
  const currentRecruiter = row.original.reclutador;

  // Memoize the loadRecruiters function
  const loadRecruiters = useCallback(async () => {
    if (recruiters) return; // Si ya tenemos los datos, no los cargamos de nuevo

    setLoading(true);
    setError(null);

    try {
      const recruitersData = await getRecruiters();
      if (Array.isArray(recruitersData) && recruitersData.length > 0) {
        setRecruiters(recruitersData);
      } else {
        setError("No se pudieron cargar los reclutadores");
      }
    } catch (error) {
      setError("Error al cargar reclutadores");
    } finally {
      setLoading(false);
    }
  }, [recruiters]);

  // Cargar reclutadores solo cuando se abre el dropdown
  useEffect(() => {
    if (isDropdownOpen) {
      loadRecruiters();
    }
  }, [isDropdownOpen, loadRecruiters]);

  const handleUserChange = async (newUser: User) => {
    if (newUser.id === currentRecruiterId) return;

    setIsUpdating(true);
    try {
      // Aquí puedes implementar la lógica para actualizar la vacante
      console.log("newUser", newUser);

      // Por ejemplo, llamar a una función como updateVacancyRecruiter
      toast.custom((t) => (
        <ToastCustomMessage
          title="Reclutador reasignado con éxito"
          message="Reclutador reasignado con éxito"
          type="success"
          onClick={() => toast.dismiss(t)}
        />
      ));
      router.refresh();
    } catch (error) {
      toast.custom((t) => (
        <ToastCustomMessage
          title="Error al reasignar reclutador"
          message="Error al reasignar reclutador"
          type="error"
          onClick={() => toast.dismiss(t)}
        />
      ));
    } finally {
      setIsUpdating(false);
      setIsDropdownOpen(false);
    }
  };

  const navigateToProfile = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    router.push(`/profile/${id}`);
    setIsDropdownOpen(false);
  };

  // Renderizar nombre del reclutador actual
  const renderCurrentRecruiterName = () => {
    if (currentRecruiter?.name) {
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-5 w-5 shrink-0">
            <AvatarImage
              src={currentRecruiter.image ?? undefined}
              alt={currentRecruiter.name}
              className="object-cover"
            />
            <AvatarFallback className="text-xs text-slate-700 dark:text-white">
              {currentRecruiter.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="truncate max-w-[90px]">{currentRecruiter.name}</span>
        </div>
      );
    }
    return "Sin asignar";
  };

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 w-full justify-between"
          disabled={isUpdating}
        >
          {isUpdating ? (
            <div className="flex items-center gap-2">
              <span>Actualizando...</span>
              <Loader2 className="h-3 w-3 animate-spin" />
            </div>
          ) : (
            renderCurrentRecruiterName()
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-72 max-h-[300px] overflow-y-auto"
        align="start"
        side="bottom"
      >
        {error ? (
          <div className="p-3 text-center">
            <p className="text-sm text-red-500 mb-2">{error}</p>
            <Button size="sm" onClick={() => loadRecruiters()}>
              Reintentar
            </Button>
          </div>
        ) : loading ? (
          <div className="p-3 text-center">
            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">
              Cargando reclutadores...
            </p>
          </div>
        ) : recruiters && recruiters.length > 0 ? (
          recruiters.map((recruiter) => (
            <DropdownMenuItem
              key={recruiter.id}
              className={`p-2 cursor-pointer ${
                recruiter.id === currentRecruiterId ? "bg-muted" : ""
              }`}
              onClick={() => handleUserChange(recruiter)}
            >
              <div className="flex items-center w-full">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage
                      src={recruiter.image ?? undefined}
                      alt={recruiter.name}
                      className="object-cover"
                    />
                    <AvatarFallback>{recruiter.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate">
                      {recruiter.name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {recruiter.email}
                    </span>
                  </div>
                </div>
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 shrink-0 ml-2"
                      onClick={(e) => navigateToProfile(e, recruiter.id)}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Ver perfil</TooltipContent>
                </Tooltip>
              </div>
            </DropdownMenuItem>
          ))
        ) : (
          <div className="p-3 text-center">
            <p className="text-sm text-muted-foreground">
              No hay reclutadores disponibles
            </p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
