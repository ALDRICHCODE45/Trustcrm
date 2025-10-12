"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building,
  CalendarIcon,
  CheckCircle2,
  ChevronDownIcon,
  CircleAlertIcon,
  ClipboardCheck,
  Clock,
  FileCheck2,
  FileText,
  History,
  ListCheck,
  ListCollapse,
  SquareUser,
  Users,
} from "lucide-react";
import { Role, VacancyEstado } from "@prisma/client";
import { format, formatDate } from "date-fns";
import { es } from "date-fns/locale";
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
import { useVacancyDetails } from "@/hooks/vacancy/use-vacancies";
import { useEffect, useState } from "react";
import { ToastCustomMessage } from "@/components/ToastCustomMessage";
import { toast } from "sonner";
import { VacancyStatusHistorySheet } from "./VacancyStatusHistorySheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogHeader,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface DetailsSectionProps {
  vacanteId: string;
  user_logged: {
    name: string;
    email: string;
    role: Role;
    image: string;
    id: string;
  };
}

export const DetailsSectionReclutador = ({
  vacanteId,
  user_logged,
}: DetailsSectionProps) => {
  const [
    isRequestingPerfilMuestraValidation,
    setIsRequestingPerfilMuestraValidation,
  ] = useState<boolean>(false);
  const [isRequestingChecklistValidation, setIsRequestingChecklistValidation] =
    useState<boolean>(false);
  const [isRequestingTernaValidation, setIsRequestingTernaValidation] =
    useState<boolean>(false);

  const {
    vacancyDetails,
    fetchVacancyDetails,
    error,
    isLoading,
    validateChecklist,
    validatePerfilMuestra,
    requestPerfilMuestraValidation,
    requestChecklistValidation,
    requestTernaValidation,
  } = useVacancyDetails(vacanteId);

  const handleRequestTernaValidation = async () => {
    try {
      await requestTernaValidation();

      toast.custom((t) => {
        return (
          <ToastCustomMessage
            title="Validación de la terna solicitada correctamente"
            message="Validación de la terna solicitada correctamente"
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
            title="Error al solicitar la validación de la terna"
            message="Error al solicitar la validación de la terna"
            type="error"
            onClick={() => {
              toast.dismiss(t);
            }}
          />
        );
      });
    }
  };

  const handleRequestChecklistValidation = async () => {
    try {
      await requestChecklistValidation();

      toast.custom((t) => {
        return (
          <ToastCustomMessage
            title="Validación del checklist solicitada correctamente"
            message="Validación del checklist solicitada correctamente"
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
            title="Error al solicitar la validación del checklist"
            message="Error al solicitar la validación del checklist"
            type="error"
            onClick={() => {
              toast.dismiss(t);
            }}
          />
        );
      });
    }
  };

  const handleRequestPerfilMuestraValidation = async () => {
    try {
      await requestPerfilMuestraValidation();

      toast.custom((t) => {
        return (
          <ToastCustomMessage
            title="Validación del perfil muestra solicitada correctamente"
            message="Validación del perfil muestra solicitada correctamente"
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
            title="Error al solicitar la validación del perfil muestra"
            message="Error al solicitar la validación del perfil muestra"
            type="error"
            onClick={() => {
              toast.dismiss(t);
            }}
          />
        );
      });
    }
  };

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

  const StatusMap = {
    [VacancyEstado.QuickMeeting]: "Quick Meeting",
    [VacancyEstado.Hunting]: "Hunting",
    [VacancyEstado.Entrevistas]: "Follow Up",
    [VacancyEstado.PrePlacement]: "Pre Placement",
    [VacancyEstado.Placement]: "Placement",
    [VacancyEstado.StandBy]: "Stand By",
    [VacancyEstado.Cancelada]: "Cancelada",
    [VacancyEstado.Perdida]: "Perdida",
  };

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
              {StatusMap[vacancyDetails.estado]}
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
          <div className="mb-2 flex gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="mr-2">
                  <History />
                  Historial
                </Button>
              </SheetTrigger>
              <SheetPortal>
                <SheetOverlay className="z-[9999]" />
                <VacancyStatusHistorySheet vacanteId={vacancyDetails.id} />
              </SheetPortal>
            </Sheet>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <ListCollapse />
                  Ver detalles
                </Button>
              </SheetTrigger>
              <SheetPortal>
                <SheetOverlay className="z-[9999]" />
                <DrawerVacancyDetails
                  vacanteId={vacancyDetails.id}
                  loggedUser={user_logged}
                />
              </SheetPortal>
            </Sheet>
            <div className="ml-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Validaciones
                    <ChevronDownIcon
                      className="-me-1 opacity-60"
                      size={16}
                      aria-hidden="true"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="z-[99999999999999]">
                  <DropdownMenuItem
                    onClick={() => {
                      setIsRequestingPerfilMuestraValidation(true);
                      setIsRequestingChecklistValidation(false);
                    }}
                    className="cursor-pointer"
                  >
                    <SquareUser
                      size={16}
                      className="opacity-60"
                      aria-hidden="true"
                    />
                    Solicitar Validación de Perfil Muestra
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setIsRequestingChecklistValidation(true);
                      setIsRequestingPerfilMuestraValidation(false);
                    }}
                    className="cursor-pointer"
                  >
                    <ListCheck
                      size={16}
                      className="opacity-60"
                      aria-hidden="true"
                    />
                    Solicitar Validación de Checklist
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => {
                      setIsRequestingTernaValidation(true);

                      setIsRequestingChecklistValidation(false);
                      setIsRequestingPerfilMuestraValidation(false);
                    }}
                    className="cursor-pointer"
                  >
                    <Users
                      size={16}
                      className="opacity-60"
                      aria-hidden="true"
                    />
                    Solicitar Validación de Terna
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <AlertDialog
          open={isRequestingPerfilMuestraValidation}
          onOpenChange={setIsRequestingPerfilMuestraValidation}
        >
          <AlertDialogContent className="z-[9999]">
            <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-full border"
                aria-hidden="true"
              >
                <CircleAlertIcon className="opacity-80" size={16} />
              </div>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se solicitará la validación
                  del perfil muestra a los usuarios administradores.
                </AlertDialogDescription>
              </AlertDialogHeader>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleRequestPerfilMuestraValidation()}
              >
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog
          open={isRequestingChecklistValidation}
          onOpenChange={setIsRequestingChecklistValidation}
        >
          <AlertDialogContent className="z-[9999]">
            <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-full border"
                aria-hidden="true"
              >
                <CircleAlertIcon className="opacity-80" size={16} />
              </div>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se solicitará la validación
                  del checklist a los usuarios administradores.
                </AlertDialogDescription>
              </AlertDialogHeader>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleRequestChecklistValidation()}
              >
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog
          open={isRequestingTernaValidation}
          onOpenChange={setIsRequestingTernaValidation}
        >
          <AlertDialogContent className="z-[9999]">
            <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-full border"
                aria-hidden="true"
              >
                <CircleAlertIcon className="opacity-80" size={16} />
              </div>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se solicitará la validación
                  de la terna a los usuarios administradores.
                </AlertDialogDescription>
              </AlertDialogHeader>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleRequestTernaValidation()}>
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="grid grid-cols-3 gap-4">
          <Card className="overflow-hidden">
            <div className="h-1 bg-blue-500"></div>
            <CardContent className="pt-4">
              <div className="text-sm text-muted-foreground">Salario</div>
              <div className="text-2xl font-semibold mt-1">
                {vacancyDetails.salario ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline">
                        <span className="max-w-[100px] truncate">
                          {vacancyDetails.salario}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="max-w-[250px] z-[9999999] py-3 shadow-none"
                      side="top"
                    >
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <p className="text-[15px] font-medium">
                            Salario de la vacante
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {vacancyDetails.salario}
                          </p>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <span>N/A</span>
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
            <ConfirmDialog
              title="Validar perfil muestra"
              description="¿Estás seguro de querer validar el perfil muestra?"
              onConfirm={handleValidatePerfilMuestra}
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={vacancyDetails.IsPerfilMuestraValidated}
                >
                  <FileCheck2 className="h-4 w-4 mr-1 text-green-500" />
                  {vacancyDetails.IsPerfilMuestraValidated
                    ? "Perfil muestra validado"
                    : "Validar perfil muestra"}
                </Button>
              }
            />
          )}

          {user_logged.role === Role.Admin && (
            <ConfirmDialog
              title="Validar checklist"
              description="¿Estás seguro de querer validar el checklist?"
              onConfirm={handleValidateChecklist}
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={vacancyDetails.IsChecklistValidated}
                >
                  <ClipboardCheck className="text-green-500 h-4 w-4 mr-1" />
                  {vacancyDetails.IsChecklistValidated
                    ? "Checklist validado"
                    : "Validar checklist"}
                </Button>
              }
            />
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
                  <div className="flex flex-col gap-1">
                    <p className="text-muted-foreground text-sm flex justify-center gap-2 items-center">
                      {vacancyDetails.candidatoContratado.name} -{" "}
                      {vacancyDetails.candidatoContratado.email}
                    </p>
                    <p className="text-muted-foreground text-sm flex justify-center gap-2 items-center">
                      {vacancyDetails.salarioFinal} -{" "}
                      {format(
                        vacancyDetails.fecha_proxima_entrada!,
                        "EEE d 'de' MMMM 'de' yyyy",
                        { locale: es }
                      )}
                    </p>
                    <p></p>
                  </div>
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
