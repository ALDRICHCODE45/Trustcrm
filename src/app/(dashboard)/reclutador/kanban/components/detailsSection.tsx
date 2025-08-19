"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building,
  CalendarIcon,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FileCheck2,
  FileText,
} from "lucide-react";
import { Role } from "@prisma/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { VacancyWithRelations } from "../../components/ReclutadorColumns";
import {
  calculateDaysFromAssignment,
  calculateDaysToDelivery,
  getDaysDifference,
  getEstadoColor,
  getProgressColor,
  getProgressPercentage,
  getTipoColor,
} from "../../components/kanbanReclutadorBoard";
import {
  Sheet,
  SheetOverlay,
  SheetPortal,
  SheetTrigger,
} from "@/components/ui/sheet";
import { VacancyDetailsChecklist } from "./VacancyDetailsChecklist";
import { DrawerVacancyDetails } from "./DrawerVacancyDetails";
import { useCandidates } from "@/hooks/candidates/use-candidates";
import { useVacancyDetails } from "@/hooks/vacancy/use-vacancies";
import { useEffect } from "react";
import { ToastCustomMessage } from "@/components/ToastCustomMessage";
import { toast } from "sonner";

interface DetailsSectionProps {
  vacante: VacancyWithRelations;
  user_logged: {
    name: string;
    email: string;
    role: Role;
    image: string;
  };
}

export const DetailsSectionReclutador = ({
  vacante,
  user_logged,
}: DetailsSectionProps) => {
  const {
    vacancyDetails,
    fetchVacancyDetails,
    error,
    isLoading,
    validateChecklist,
    validatePerfilMuestra,
  } = useVacancyDetails(vacante.id);

  const handleValidateChecklist = async () => {
    try {
      await validateChecklist();
      toast.custom((t) => {
        return (
          <ToastCustomMessage
            title="Checklist validado correctamente"
            message="Checklist validado correctamente"
            type="success"
            onClick={() => {
              toast.dismiss(t);
            }}
          />
        );
      });
    } catch (e) {
      toast.custom((t) => {
        return (
          <ToastCustomMessage
            title="Error al validar el checklist"
            message="Error al validar el checklist"
            type="error"
            onClick={() => {
              toast.dismiss(t);
            }}
          />
        );
      });
    } finally {
      fetchVacancyDetails();
    }
  };

  useEffect(() => {
    fetchVacancyDetails();
  }, [fetchVacancyDetails]);

  const handleValidatePerfilMuestra = async () => {
    try {
      await validatePerfilMuestra();
      toast.custom((t) => {
        return (
          <ToastCustomMessage
            title="Perfil muestra validado correctamente"
            message="Perfil muestra validado correctamente"
            type="success"
            onClick={() => {
              toast.dismiss(t);
            }}
          />
        );
      });
    } catch (e) {
      toast.custom((t) => {
        return (
          <ToastCustomMessage
            title="Error al validar el perfil muestra"
            message="Error al validar el perfil muestra"
            type="error"
            onClick={() => {
              toast.dismiss(t);
            }}
          />
        );
      });
    } finally {
      fetchVacancyDetails();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-muted-foreground">Cargando detalles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-destructive">Error: {error}</div>
      </div>
    );
  }

  if (!vacancyDetails) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-muted-foreground">
          No se encontraron detalles de la vacante
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-4 z-[999]">
      <div className="bg-muted/30 p-4 rounded-lg border border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={vacancyDetails.reclutador?.image || ""}
                alt={vacancyDetails.reclutador?.name || "Reclutador"}
                className="w-full h-full object-cover"
              />
              <AvatarFallback>
                {vacancyDetails.reclutador?.name?.charAt(0) || "R"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground">
                Reclutador asignado
              </p>
              <p className="font-normal text-md text-gray-700 dark:text-muted-foreground">
                {vacancyDetails.reclutador?.name || "Sin reclutador"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge
              variant="outline"
              className={getTipoColor(vacancyDetails.tipo)}
            >
              {vacancyDetails.tipo}
            </Badge>
            <Badge
              variant="outline"
              className={`${getEstadoColor(vacancyDetails.estado)}`}
            >
              {vacancyDetails.estado}
            </Badge>

            <Badge variant="outline" className="bg-muted">
              {vacancyDetails.cliente?.cuenta || "Sin cliente"}
            </Badge>
          </div>
        </div>
        {/* Información de cliente y tiempos */}
        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-3 space-y-3">
            <div className="flex items-center">
              <Building className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Cliente:</span>
              <span className="ml-2 font-normal text-md text-gray-700 dark:text-muted-foreground">
                {vacancyDetails.cliente?.cuenta || "Sin cliente"}
              </span>
            </div>
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Fecha asignación:
              </span>
              <span className="ml-2 font-normal text-md text-gray-700 dark:text-muted-foreground">
                {vacancyDetails.fechaAsignacion
                  ? format(vacancyDetails.fechaAsignacion, "EE, dd MMMM yyyy", {
                      locale: es,
                    })
                  : "Sin fecha"}
              </span>
            </div>
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Fecha entrega:
              </span>
              <span className="ml-2 font-normal text-md text-gray-700 dark:text-muted-foreground ">
                {vacancyDetails.fechaEntrega
                  ? format(vacancyDetails.fechaEntrega, "EE, dd MMMM yyyy", {
                      locale: es,
                    })
                  : "Sin fecha"}
              </span>
            </div>
          </div>
          <div className="col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">
                    Tiempo transcurrido:
                  </span>
                  <span className="font-normal text-xs text-gray-700 dark:text-muted-foreground">
                    (Placement)
                  </span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="h-6 px-2">
                <span className="font-normal text-md text-gray-700 dark:text-muted-foreground">
                  {vacancyDetails.fechaAsignacion
                    ? `${calculateDaysFromAssignment(
                        vacancyDetails.fechaAsignacion
                      )} días`
                    : "Sin fecha"}
                </span>
              </Button>
            </div>
            <div className="pt-2">
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    vacancyDetails.fechaEntrega
                      ? getProgressColor(
                          calculateDaysToDelivery(vacancyDetails.fechaEntrega)
                        )
                      : "bg-gray-400"
                  }`}
                  style={{
                    width: `${
                      vacancyDetails.fechaAsignacion &&
                      vacancyDetails.fechaEntrega
                        ? getProgressPercentage(
                            vacancyDetails.fechaAsignacion,
                            vacancyDetails.fechaEntrega
                          )
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0</span>
                <span>
                  {vacancyDetails.fechaAsignacion && vacancyDetails.fechaEntrega
                    ? `${getDaysDifference(
                        vacancyDetails.fechaAsignacion,
                        vacancyDetails.fechaEntrega
                      )}d`
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Información financiera */}
      <div>
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium uppercase text-muted-foreground mb-3 flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Información financiera
          </h4>
          <div className="mb-2">
            <DrawerVacancyDetails vacante={vacancyDetails} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Card className="overflow-hidden">
            <div className="h-1 bg-blue-500"></div>
            <CardContent className="pt-4">
              <div className="text-sm text-muted-foreground">Salario</div>
              <div className="text-2xl font-semibold mt-1">
                $
                {vacancyDetails.salario?.toLocaleString() || (
                  <span className="">N/A</span>
                )}
              </div>
            </CardContent>
          </Card>
          {user_logged.role === Role.Admin && (
            <>
              <Card className="overflow-hidden">
                <div className="h-1 bg-purple-500"></div>
                <CardContent className="pt-4">
                  <div className="text-sm text-muted-foreground">Fee</div>
                  <div className="text-2xl font-semibold mt-1">
                    {vacancyDetails.fee || "N/A"}%
                  </div>
                </CardContent>
              </Card>
              <Card className="overflow-hidden">
                <div className="h-1 bg-green-500"></div>
                <CardContent className="pt-4">
                  <div className="text-sm text-muted-foreground">
                    Valor factura
                  </div>
                  <div className="text-2xl font-semibold mt-1">
                    ${vacancyDetails.valorFactura?.toLocaleString() || "N/A"}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-1" />
                Checklist
              </Button>
            </SheetTrigger>
            <SheetPortal>
              <SheetOverlay className="z-[9999]" />
              <VacancyDetailsChecklist
                vacante={vacancyDetails}
                onSaveRequisitos={async () => {
                  await fetchVacancyDetails();
                }}
              />
            </SheetPortal>
          </Sheet>
        </div>
        <div className="flex gap-2">
          {user_logged.role === Role.Admin && (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={handleValidatePerfilMuestra}
              disabled={vacancyDetails.IsPerfilMuestraValidated}
            >
              <FileCheck2 className="h-4 w-4 mr-1 text-green-500" />
              {vacancyDetails.IsPerfilMuestraValidated
                ? "Perfil muestra validado"
                : "Validar perfil muestra"}
            </Button>
          )}

          {user_logged.role === Role.Admin && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleValidateChecklist}
              disabled={vacancyDetails.IsChecklistValidated}
            >
              <ClipboardCheck className="text-green-500 h-4 w-4 mr-1" />
              {vacancyDetails.IsChecklistValidated
                ? "Checklist validado"
                : "Validar checklist"}
            </Button>
          )}
        </div>
      </div>
      {/* Candidato contratado (condicional) */}
      {vacancyDetails.candidatoContratado && (
        <Card className="overflow-hidden border-green-200 dark:border-green-800">
          <div className="h-1 bg-green-500"></div>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-medium">Candidato contratado</h4>
                  <p className="text-muted-foreground text-sm flex justify-center gap-2 items-center">
                    {vacancyDetails.candidatoContratado.name} -{" "}
                    {vacancyDetails.candidatoContratado.email}
                  </p>
                </div>
              </div>
              <a
                href={vacancyDetails.candidatoContratado.cv?.url || ""}
                target="_blank"
              >
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-1" />
                  Ver CV
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
