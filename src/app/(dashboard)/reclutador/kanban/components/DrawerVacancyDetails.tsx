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

export const DrawerVacancyDetails = ({ vacanteId }: { vacanteId: string }) => {
  const [isEditing, setIsEditing] = useState(false);

  const {
    isLoading: IsVacancyLoading,
    fetchVacancyDetails,
    vacancyDetails,
  } = useVacancyDetails(vacanteId);

  useEffect(() => {
    fetchVacancyDetails();
  }, [fetchVacancyDetails]);

  if (IsVacancyLoading || !vacancyDetails) {
    return <Loader2 className="animate-spin" />;
  }

  return (
    <SheetContent side="left" className="z-[99999] min-w-[25vw]">
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
            {!isEditing && (
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

        <VacancyDetailsForm
          vacante={vacancyDetails}
          isEditing={isEditing}
          onEditingChange={setIsEditing}
          onVacancyUpdated={async () => {
            await fetchVacancyDetails();
          }}
        />
      </div>
    </SheetContent>
  );
};
