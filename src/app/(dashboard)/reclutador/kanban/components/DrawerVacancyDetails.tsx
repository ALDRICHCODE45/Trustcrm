"use client";
import { Button } from "@/components/ui/button";
import { VacancyWithRelations } from "../../components/ReclutadorColumns";
import { ListCollapse, Edit2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { VacancyDetailsForm } from "./VacancyDetailsForm";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useVacancyDetails } from "@/hooks/vacancy/use-vacancies";

export const DrawerVacancyDetails = ({
  vacanteId,
  loggedUser,
}: {
  vacanteId: string;
  loggedUser?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const {
    isLoading: IsVacancyLoading,
    fetchVacancyDetails,
    vacancyDetails,
  } = useVacancyDetails(vacanteId);

  // Solo cargar datos cuando el Sheet se abre por primera vez
  useEffect(() => {
    if (isOpen && !vacancyDetails) {
      fetchVacancyDetails();
    }
  }, [isOpen, vacancyDetails, fetchVacancyDetails]);

  return (
    <SheetContent
      side="left"
      className="z-[9999] min-w-[25vw]"
      onOpenAutoFocus={() => setIsOpen(true)}
    >
      <div className="mx-auto w-full max-w-4xl flex flex-col h-full">
        <SheetHeader className="pb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-xl">
                Detalles de la Vacante
              </SheetTitle>
              <SheetDescription>
                {isEditing
                  ? "Editando información adicional sobre la posición"
                  : "Información adicional sobre la posición"}
              </SheetDescription>
            </div>
            {!isEditing && vacancyDetails && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Edit2 size={16} />
                Editar
              </Button>
            )}
          </div>
        </SheetHeader>

        {IsVacancyLoading ? (
          <div className="flex justify-center items-center h-full flex-col gap-4">
            <Loader2 className="animate-spin" size={24} />
            <p className="text-sm text-muted-foreground">
              Cargando detalles de la vacante...
            </p>
          </div>
        ) : vacancyDetails ? (
          <VacancyDetailsForm
            vacante={vacancyDetails}
            isEditing={isEditing}
            onEditingChange={setIsEditing}
            loggedUser={loggedUser}
            onVacancyUpdated={async () => {
              await fetchVacancyDetails();
            }}
          />
        ) : (
          <div className="flex justify-center items-center h-full flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              No se pudieron cargar los detalles de la vacante
            </p>
          </div>
        )}
      </div>
    </SheetContent>
  );
};
