"use client";
import { useEffect, useState } from "react";
import { PersonWithRelations } from "@/app/(dashboard)/list/reclutamiento/components/FinalTernaSheet";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Plus,
  UserPlus,
  AlertCircle,
  Mail,
  Phone,
  UserCheck,
  Pencil,
  Trash2,
  FileUser,
  FileCheck2,
  FolderCheck,
  FolderX,
} from "lucide-react";
import { MoreVertical } from "lucide-react";
import { ToastCustomMessage } from "@/components/ToastCustomMessage";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserRoundX, LoaderCircleIcon } from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CompareChecklistForm } from "@/app/(dashboard)/list/reclutamiento/VacancyFormComponents/CreateVacancyComponents/CompareChecklistForm";
import { CreateCandidateForm } from "./CreateCandidateForm";
import { EditCandidateDialog } from "./EditCandidateDialog";
import { useCandidates } from "@/hooks/candidates/use-candidates";
import { CandidateSheetDetails } from "./CandidateSheetDetails";
import { useVacancyDetails } from "@/hooks/vacancy/use-vacancies";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CreateCandidateFormData } from "@/zod/createCandidateSchema";
import { Role } from "@prisma/client";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { TernaHistoryDialog } from "./TernaHistoryDialog";

interface CandidatesSectionProps {
  vacancyId: string;
  user_logged: {
    name: string;
    email: string;
    role: Role;
    image: string;
  };
}

export const CandidatesSectionReclutador = ({
  vacancyId,
  user_logged,
}: CandidatesSectionProps) => {
  // Usar el hook optimizado para candidatos
  const {
    candidates,
    isLoading,
    error,
    isSelecting,
    addCandidate,
    deleteCandidateAction,
    selectCandidate,
    deselectCandidate,
    fetchCandidates,
    validateCandidate,
    desValidateCandidate,
    validarTerna,
    unvalidateTerna,
  } = useCandidates(vacancyId);

  const {
    vacancyDetails,
    fetchVacancyDetails,
    isLoading: isLoadingVacancyDetails,
  } = useVacancyDetails(vacancyId);

  //refrescar los detalles de la vacante cada vez que la tab se renderiza
  useEffect(() => {
    fetchVacancyDetails();
  }, [fetchVacancyDetails]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [alertDialogDelete, setAlertDialogDelete] = useState<boolean>(false);
  const [currentEditingCandidate, setCurrentEditingCandidate] =
    useState<PersonWithRelations | null>(null);
  const [candidateToDelete, setCandidateToDelete] =
    useState<PersonWithRelations | null>(null);

  // Estados para la selección de candidatos para la terna
  const [selectedCandidatesForTerna, setSelectedCandidatesForTerna] = useState<
    string[]
  >([]);
  const [showTernaValidationDialog, setShowTernaValidationDialog] =
    useState<boolean>(false);

  const handleEditCandidate = (candidato: PersonWithRelations) => {
    setCurrentEditingCandidate(candidato);
    setEditDialogOpen(true);
  };

  const handleCandidateUpdated = async (
    updatedCandidate: PersonWithRelations
  ) => {
    // obtener los candidatos actualizados
    await fetchCandidates();
  };

  const handleCandidateCreated = async (
    candidateData: CreateCandidateFormData
  ) => {
    try {
      const result = await addCandidate(candidateData);
      if (result && "ok" in result && !result.ok) {
        toast.custom((t) => (
          <ToastCustomMessage
            title="Error al crear candidato"
            message={result.message || "Error al crear candidato"}
            type="error"
            onClick={() => toast.dismiss(t)}
          />
        ));
        return;
      }
      toast.custom((t) => (
        <ToastCustomMessage
          title="Candidato creado exitosamente"
          message="El candidato ha sido agregado correctamente"
          type="success"
          onClick={() => toast.dismiss(t)}
        />
      ));
      setIsDialogOpen(false);
    } catch (error) {
      toast.custom((t) => (
        <ToastCustomMessage
          title="Error al crear candidato"
          message={error instanceof Error ? error.message : "Error desconocido"}
          type="error"
          onClick={() => toast.dismiss(t)}
        />
      ));
    }
  };

  const handleDeleteCandidate = async (candidateId: string) => {
    try {
      await deleteCandidateAction(candidateId);
      toast.custom((t) => (
        <ToastCustomMessage
          title="Candidato eliminado exitosamente"
          message="El candidato ha sido eliminado correctamente"
          type="success"
          onClick={() => toast.dismiss(t)}
        />
      ));
    } catch (error) {
      toast.custom((t) => (
        <ToastCustomMessage
          title="Error al eliminar candidato"
          message={error instanceof Error ? error.message : "Error desconocido"}
          type="error"
          onClick={() => toast.dismiss(t)}
        />
      ));
    }
  };

  const handleMarkCandidateAsContratado = async (candidateId: string) => {
    try {
      await selectCandidate(candidateId);

      toast.custom((t) => (
        <ToastCustomMessage
          title="Candidato seleccionado correctamente"
          message="El candidato ha sido SELECCIONADO"
          type="success"
          onClick={() => toast.dismiss(t)}
        />
      ));
    } catch (error) {
      toast.custom((t) => (
        <ToastCustomMessage
          title="Error al seleccionar al candidato"
          message={error instanceof Error ? error.message : "Error desconocido"}
          type="error"
          onClick={() => toast.dismiss(t)}
        />
      ));
    }
  };

  const handleDeseleccionarCandidato = async () => {
    try {
      await deselectCandidate();

      toast.custom((t) => (
        <ToastCustomMessage
          title="Candidato deseleccionado correctamente"
          message="El candidato ha sido DESELECCIONADO"
          type="success"
          onClick={() => toast.dismiss(t)}
        />
      ));
    } catch (error) {
      toast.custom((t) => (
        <ToastCustomMessage
          title="Error al deseleccionar al candidato"
          message={error instanceof Error ? error.message : "Error desconocido"}
          type="error"
          onClick={() => toast.dismiss(t)}
        />
      ));
    }
  };

  const openDeleteDialog = (candidate: PersonWithRelations) => {
    setCandidateToDelete(candidate);
    setAlertDialogDelete(true);
  };

  const confirmDelete = () => {
    if (candidateToDelete) {
      handleDeleteCandidate(candidateToDelete.id);
      setAlertDialogDelete(false);
      setCandidateToDelete(null);
    }
  };

  const handleDesvalidateCandidate = async (candidateId: string) => {
    try {
      const response = await desValidateCandidate(candidateId);
      if (!response.ok) {
        toast.custom((t) => {
          return (
            <ToastCustomMessage
              title="Error al desvalidar candidato"
              message={response.message || "Error al desvalidar candidato"}
              type="error"
              onClick={() => toast.dismiss(t)}
            />
          );
        });
        return;
      }
      toast.custom((t) => {
        return (
          <ToastCustomMessage
            title="Candidato desvalidado correctamente"
            message="El candidato ha sido desvalidado correctamente"
            type="success"
            onClick={() => toast.dismiss(t)}
          />
        );
      });
      fetchCandidates();
    } catch (e) {
      toast.custom((t) => {
        return (
          <ToastCustomMessage
            title="Error al desvalidar candidato"
            message={"Error desconocido"}
            type="error"
            onClick={() => toast.dismiss(t)}
          />
        );
      });
    }
  };

  const handleValidateCandidate = async (candidateId: string) => {
    try {
      const response = await validateCandidate(candidateId);
      if (!response.ok) {
        toast.custom((t) => {
          return (
            <ToastCustomMessage
              title="Error al validar candidato"
              message={response.message || "Error al validar candidato"}
              type="error"
              onClick={() => toast.dismiss(t)}
            />
          );
        });
        return;
      }
      toast.custom((t) => {
        return (
          <ToastCustomMessage
            title="Candidato validado correctamente"
            message="El candidato ha sido validado correctamente"
            type="success"
            onClick={() => toast.dismiss(t)}
          />
        );
      });
      fetchCandidates();
    } catch (error) {
      toast.custom((t) => {
        return (
          <ToastCustomMessage
            title="Error al validar candidato"
            message={
              error instanceof Error ? error.message : "Error desconocido"
            }
            type="error"
            onClick={() => toast.dismiss(t)}
          />
        );
      });
    } finally {
      fetchCandidates();
    }
  };

  // Función para manejar la selección de candidatos para la terna
  const handleCandidateSelectionForTerna = (
    candidateId: string,
    isSelected: boolean
  ) => {
    setSelectedCandidatesForTerna((prev) =>
      isSelected
        ? [...prev, candidateId]
        : prev.filter((id) => id !== candidateId)
    );
  };

  // Función para abrir el diálogo de validación de terna
  const handleOpenTernaValidation = () => {
    setSelectedCandidatesForTerna([]);
    setShowTernaValidationDialog(true);
  };

  const handleValidateTerna = async () => {
    try {
      if (selectedCandidatesForTerna.length === 0) {
        toast.custom((t) => {
          return (
            <ToastCustomMessage
              title="Selecciona candidatos"
              message="Debe seleccionar al menos un candidato para la terna"
              type="error"
              onClick={() => toast.dismiss(t)}
            />
          );
        });
        return;
      }

      const response = await validarTerna(
        vacancyId,
        selectedCandidatesForTerna
      );
      if (!response.ok) {
        toast.custom((t) => {
          return (
            <ToastCustomMessage
              title="Error al validar la terna"
              message={response.message || "Error al validar la terna"}
              type="error"
              onClick={() => toast.dismiss(t)}
            />
          );
        });
        return;
      }
      toast.custom((t) => {
        return (
          <ToastCustomMessage
            title="Terna validada correctamente"
            message="La terna ha sido validada correctamente"
            type="success"
            onClick={() => toast.dismiss(t)}
          />
        );
      });
      setShowTernaValidationDialog(false);
      setSelectedCandidatesForTerna([]);
      fetchVacancyDetails();
    } catch (error) {
      toast.custom((t) => {
        return (
          <ToastCustomMessage
            title="Error al validar la terna"
            message={
              error instanceof Error ? error.message : "Error desconocido"
            }
            type="error"
            onClick={() => toast.dismiss(t)}
          />
        );
      });
    }
  };

  const handleUnvalidateTerna = async () => {
    try {
      const response = await unvalidateTerna(vacancyId);

      if (!response.ok) {
        toast.custom((t) => {
          return (
            <ToastCustomMessage
              title="Error al desvalidar la terna"
              message={response.message || "Error al desvalidar la terna"}
              type="error"
              onClick={() => toast.dismiss(t)}
            />
          );
        });
        return;
      }

      toast.custom((t) => {
        return (
          <ToastCustomMessage
            title="Terna desvalidada correctamente"
            message="La terna ha sido desvalidada correctamente"
            type="success"
            onClick={() => toast.dismiss(t)}
          />
        );
      });
      fetchVacancyDetails();
    } catch (error) {
      toast.custom((t) => {
        return (
          <ToastCustomMessage
            title="Error al desvalidar la terna"
            message={
              error instanceof Error ? error.message : "Error desconocido"
            }
            type="error"
            onClick={() => toast.dismiss(t)}
          />
        );
      });
    }
  };

  // Mostrar estado de carga
  if (isLoading || isLoadingVacancyDetails) {
    return (
      <div className="space-y-6 mt-4">
        <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 mb-2" />
          <p className="text-sm">Cargando candidatos...</p>
        </div>
      </div>
    );
  }

  if (!vacancyDetails && !isLoadingVacancyDetails) {
    return (
      <div className="space-y-6 mt-4">
        <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
          <AlertCircle className="h-10 w-10 mb-4 text-red-400" />
          <p className="text-base font-medium mb-2 text-red-600">
            Error al cargar la vacante, intenta recargar la página
          </p>
        </div>
      </div>
    );
  }

  // Mostrar error si existe
  if (error) {
    return (
      <div className="space-y-6 mt-4">
        <div className="flex flex-col items-center justify-center h-[300px] text-center">
          <AlertCircle className="h-10 w-10 mb-4 text-red-400" />
          <p className="text-base font-medium mb-2 text-red-600">
            Error al cargar candidatos
          </p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-4">
      {candidates && candidates.length > 0 ? (
        <div className="space-y-6 mt-4 w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-muted-foreground">
              Candidatos
            </h4>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="px-3 py-1 bg-background">
                {candidates.length} candidato(s)
              </Badge>
              {user_logged.role === Role.Admin &&
                vacancyDetails?.fechaEntregaTerna === null && (
                  <Button
                    onClick={handleOpenTernaValidation}
                    size="sm"
                    variant="outline"
                    className="gap-1"
                  >
                    <FolderCheck className="mr-1 text-gray-700" />
                    Validar terna
                  </Button>
                )}

              {user_logged.role === Role.Admin &&
                vacancyDetails?.fechaEntregaTerna !== null && (
                  <ConfirmDialog
                    title="Desvalidar terna"
                    description="¿Estás seguro de querer desvalidar la terna?"
                    onConfirm={() => handleUnvalidateTerna()}
                    trigger={
                      <Button size="sm" variant="outline" className="gap-1">
                        <FolderX className="mr-1 text-gray-700" />
                        Desvalidar terna
                      </Button>
                    }
                  />
                  // <Button
                  //   onClick={() => handleUnvalidateTerna()}
                  //   size="sm"
                  //   variant="outline"
                  //   className="gap-1"
                  // >
                  //   <FolderX className="mr-1 text-gray-700" />
                  //   Desvalidar terna
                  // </Button>
                )}

              {/* Botón para ver historial de ternas (disponible siempre para Admin) */}
              {user_logged.role === Role.Admin && vacancyDetails && (
                <TernaHistoryDialog
                  vacancyId={vacancyId}
                  vacancyTitle={vacancyDetails.posicion}
                />
              )}

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Plus size={16} className="text-gray-700" />
                    <span>Agregar</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="z-[9999] max-h-[70vh] overflow-y-auto flex flex-col gap-0  p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
                  <DialogHeader className="contents space-y-0 text-left">
                    <DialogTitle className="border-b px-6 py-4 text-base">
                      Agregar candidato
                    </DialogTitle>
                  </DialogHeader>
                  <DialogDescription className="sr-only">
                    Completar la información del nuevo candidato.
                  </DialogDescription>
                  <div className="px-6 pt-4 pb-2">
                    <p className="text-sm text-muted-foreground">
                      Complete la información del candidato.
                    </p>
                  </div>
                  <div className="px-6 pt-4 pb-6">
                    <div className="max-h-[50vh] overflow-y-auto">
                      <CreateCandidateForm
                        vacancyId={vacancyId}
                        onCandidateCreated={handleCandidateCreated}
                        onCancel={() => setIsDialogOpen(false)}
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Lista de candidatos */}
          <div className="space-y-3">
            <ScrollArea className="h-[350px] w-full ">
              <div className="space-y-3 p-4">
                {candidates.map(
                  (candidato: PersonWithRelations, index: number) => (
                    <Card
                      key={candidato.id}
                      className="group hover:shadow-sm transition-shadow duration-200"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          {/* Avatar compacto */}
                          <div className="relative">
                            <Avatar className="h-11 w-11">
                              <AvatarImage
                                src={
                                  typeof candidato.cv === "string"
                                    ? candidato.cv
                                    : (candidato.cv as any)?.url || ""
                                }
                                alt={candidato.name}
                                className="object-cover"
                              />
                              <AvatarFallback className="bg-muted text-muted-foreground font-medium">
                                {candidato.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {/* Indicador de estado minimalista */}
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          </div>

                          {/* Información del candidato */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-sm text-foreground mb-1 truncate">
                                  {candidato.name}
                                </h3>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Mail className="h-3 w-3" />
                                    <span className="truncate">
                                      {candidato.email || "Sin email"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Phone className="h-3 w-3" />
                                    <span>
                                      {candidato.phone || "Sin teléfono"}
                                    </span>
                                  </div>
                                  {candidato.cv?.url && (
                                    <div className="">
                                      <Link
                                        className="flex hover:underline items-center gap-2 text-xs text-muted-foreground"
                                        href={candidato.cv.url}
                                        target="_blank"
                                      >
                                        <FileUser className="h-3 w-3" />
                                        <span className="">Ver CV</span>
                                      </Link>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Dropdown de acciones */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-40 z-[9999]"
                                >
                                  {candidato.vacanciesContratado &&
                                  candidato.vacanciesContratado.length > 0 ? (
                                    <ConfirmDialog
                                      title="Deseleccionar candidato"
                                      description="¿Estás seguro de querer deseleccionar este candidato?"
                                      onConfirm={() =>
                                        handleDeseleccionarCandidato()
                                      }
                                      trigger={
                                        <Button
                                          variant="outline"
                                          className="cursor-pointer w-full"
                                        >
                                          <UserRoundX className="h-4 w-4 mr-2" />
                                          Deseleccionar
                                        </Button>
                                      }
                                    />
                                  ) : (
                                    <ConfirmDialog
                                      title="Seleccionar candidato"
                                      description="¿Estás seguro de querer seleccionar este candidato?"
                                      onConfirm={() =>
                                        handleMarkCandidateAsContratado(
                                          candidato.id
                                        )
                                      }
                                      trigger={
                                        <Button
                                          variant="outline"
                                          className="cursor-pointer w-full"
                                        >
                                          {isSelecting ? (
                                            <LoaderCircleIcon
                                              className="-ms-1 animate-spin"
                                              size={16}
                                              aria-hidden="true"
                                            />
                                          ) : (
                                            <UserCheck className="h-4 w-4 mr-2" />
                                          )}
                                          Seleccionar
                                        </Button>
                                      }
                                    />
                                  )}
                                  <DropdownMenuSeparator />

                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleEditCandidate(candidato)
                                    }
                                    className="cursor-pointer"
                                  >
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    onClick={() => openDeleteDialog(candidato)}
                                    className="cursor-pointer"
                                    variant="destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>

                        {/* Información de estado */}
                        <div className="mt-3 pt-2 border-t flex justify-between">
                          <CompareChecklistForm
                            vacante={vacancyDetails!}
                            candidateId={candidato.id}
                            refreshCandidates={() => {
                              fetchVacancyDetails();
                              fetchCandidates();
                            }}
                          />
                          <div className="flex items-center gap-3">
                            {user_logged.role === Role.Admin &&
                              !candidato.IsCandidateValidated && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="mt-4"
                                    >
                                      <UserCheck />
                                      Validar
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="z-[9999]">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Validar candidato
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Esta acción permitirá que la vacante
                                        pueda actualizarce.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancelar
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        onClick={() =>
                                          handleValidateCandidate(candidato.id)
                                        }
                                      >
                                        Validar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            {user_logged.role === Role.Admin &&
                              candidato.IsCandidateValidated && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="mt-4"
                                    >
                                      <UserCheck className="h-4 w-4 mr-2" />
                                      Validado
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="z-[9999]">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Deshacer validación
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Esta acción deshacerá la validación del
                                        candidato.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancelar
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        onClick={() =>
                                          handleDesvalidateCandidate(
                                            candidato.id
                                          )
                                        }
                                      >
                                        Deshacer validación
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}

                            <CandidateSheetDetails candidate={candidato} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground bg-muted/10 rounded-lg mt-4">
          <AlertCircle className="h-10 w-10 mb-4 text-muted-foreground/60" />
          <p className="text-base font-medium mb-2">
            No hay candidatos en la terna final
          </p>
          <p className="text-sm text-center max-w-sm mb-4">
            Cuando se agreguen candidatos a la terna final, aparecerán aquí para
            su revisión.
          </p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Agregar candidatos
              </Button>
            </DialogTrigger>
            <DialogContent className="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5 z-[9999]">
              <DialogHeader className="contents space-y-0 text-left">
                <DialogTitle className="border-b px-6 py-4 text-base">
                  Agregar candidato
                </DialogTitle>
              </DialogHeader>
              <DialogDescription className="sr-only">
                Completar la información del nuevo candidato.
              </DialogDescription>
              <div className="px-6 pt-4 pb-2">
                <p className="text-sm text-muted-foreground">
                  Complete la información del candidato. El nombre es requerido.
                </p>
              </div>
              <div className="px-6 pt-4 pb-6">
                <div className="max-h-[50vh] overflow-y-auto">
                  <CreateCandidateForm
                    vacancyId={vacancyId}
                    onCandidateCreated={handleCandidateCreated}
                    onCancel={() => setIsDialogOpen(false)}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Dialog para eliminar candidato */}
      <AlertDialog open={alertDialogDelete} onOpenChange={setAlertDialogDelete}>
        <AlertDialogContent className="z-[9999]">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar candidato</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Este candidato será eliminado
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline">Cancelar</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" onClick={confirmDelete}>
                Eliminar
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog para editar candidato */}
      <EditCandidateDialog
        refreshCandidates={fetchCandidates}
        open={editDialogOpen}
        closeDialog={() => setEditDialogOpen(false)}
        onOpenChange={setEditDialogOpen}
        candidate={currentEditingCandidate}
        onCandidateUpdated={handleCandidateUpdated}
      />

      {/* Dialog para validación de terna con selección de candidatos */}
      <Dialog
        open={showTernaValidationDialog}
        onOpenChange={setShowTernaValidationDialog}
      >
        <DialogContent className="z-[9999] max-h-[70vh] overflow-y-auto flex flex-col gap-0 p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
          <DialogHeader className="contents space-y-0 text-left">
            <DialogTitle className="border-b px-6 py-4 text-base">
              Validar terna final
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="sr-only">
            Seleccionar candidatos para formar la terna final.
          </DialogDescription>
          <div className="px-6 pt-4 pb-2">
            <p className="text-sm text-muted-foreground">
              Selecciona los candidatos que formarán parte de la terna final.
              Esta acción creará un registro en el historial.
            </p>
          </div>
          <div className="px-6 pt-4 pb-6">
            <div className="space-y-4">
              {candidates && candidates.length > 0 ? (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Candidatos disponibles ({candidates.length})
                  </Label>
                  <div className="max-h-[300px] overflow-y-auto space-y-2">
                    {candidates.map((candidate: PersonWithRelations) => (
                      <div
                        key={candidate.id}
                        className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <Checkbox
                          id={`candidate-${candidate.id}`}
                          checked={selectedCandidatesForTerna.includes(
                            candidate.id
                          )}
                          onCheckedChange={(checked) =>
                            handleCandidateSelectionForTerna(
                              candidate.id,
                              checked as boolean
                            )
                          }
                        />
                        <div className="flex-1 min-w-0">
                          <Label
                            htmlFor={`candidate-${candidate.id}`}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {candidate.name}
                          </Label>
                          <p className="text-xs text-muted-foreground truncate">
                            {candidate.email || "Sin email"} •{" "}
                            {candidate.phone || "Sin teléfono"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    No hay candidatos disponibles para formar la terna
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  {selectedCandidatesForTerna.length} candidato(s)
                  seleccionado(s)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowTernaValidationDialog(false)}
                    size="sm"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleValidateTerna}
                    disabled={selectedCandidatesForTerna.length === 0}
                    size="sm"
                  >
                    <FolderCheck className="h-4 w-4 mr-2" />
                    Validar terna
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
