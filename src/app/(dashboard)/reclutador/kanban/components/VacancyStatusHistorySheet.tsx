import { useEffect, useState } from "react";
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useVacancyStats } from "@/hooks/vacancy/useVacancyStats";
import { VacancyEstado } from "@prisma/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Clock } from "lucide-react";

// Mapeo de estados a nombres en español
const getStatusDisplayName = (status: VacancyEstado) => {
  switch (status) {
    case "QuickMeeting":
      return "Quick Meeting";
    case "Hunting":
      return "Hunting";
    case "Entrevistas":
      return "Entrevistas";
    case "PrePlacement":
      return "Pre-Placement";
    case "Placement":
      return "Placement";
    case "Perdida":
      return "Perdida";
    case "Cancelada":
      return "Cancelada";
    default:
      return status;
  }
};

export const VacancyStatusHistorySheet = ({
  vacanteId,
}: {
  vacanteId: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoading, error, history, getVacancyHistory } =
    useVacancyStats(vacanteId);

  useEffect(() => {
    if (isOpen && vacanteId && history.length === 0) {
      getVacancyHistory();
    }
  }, [isOpen, vacanteId, history.length, getVacancyHistory]);

  if (isLoading) {
    return (
      <SheetContent className="z-[99999]">
        <SheetHeader>
          <SheetTitle>Historial de cambios</SheetTitle>
        </SheetHeader>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </SheetContent>
    );
  }

  if (error) {
    return (
      <SheetContent className="z-[99999]">
        <SheetHeader>
          <SheetTitle>Historial de estados</SheetTitle>
        </SheetHeader>
        <div className="flex items-center justify-center h-32 text-red-500">
          <p>{error}</p>
        </div>
      </SheetContent>
    );
  }

  return (
    <SheetContent
      className="z-[99999] overflow-y-auto min-w-[30vw]"
      onOpenAutoFocus={() => setIsOpen(true)}
    >
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Historial de estados
        </SheetTitle>
        <SheetDescription>
          Cronología de cambios de estado de la vacante
        </SheetDescription>
      </SheetHeader>

      <div className="mt-6">
        {/* Timeline cronológico minimalista */}
        {history.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Clock className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No hay historial disponible</p>
          </div>
        ) : (
          <div className="relative">
            {/* Línea vertical del timeline */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200"></div>

            <div className="space-y-4">
              {history.map((record, index) => (
                <div
                  key={record.id}
                  className="relative flex items-start gap-4"
                >
                  {/* Punto del timeline */}
                  <div className="relative z-10 flex-shrink-0">
                    <div
                      className={`w-8 h-8 rounded-full border-2 bg-white flex items-center justify-center ${
                        index === 0
                          ? "border-blue-500 shadow-sm"
                          : "border-gray-300"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          index === 0 ? "bg-blue-500" : "bg-gray-400"
                        }`}
                      ></div>
                    </div>
                  </div>

                  {/* Contenido del timeline */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-3 mb-1">
                      <Badge variant="outline" className="">
                        {getStatusDisplayName(record.status)}
                      </Badge>
                      {index === 0 && (
                        <span className="text-xs text-blue-600 font-medium">
                          Estado actual
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        {format(
                          new Date(record.changedAt),
                          "d MMM yyyy 'a las' HH:mm",
                          {
                            locale: es,
                          }
                        )}
                      </span>
                      <span>por {record.changedBy.name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </SheetContent>
  );
};
