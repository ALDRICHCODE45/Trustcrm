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
      await addCandidate(candidateData);
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

  const handleValidateCandidate = async (candidateId: string) => {
    try {
      await validateCandidate(candidateId);
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
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Plus size={16} />
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
                {candidates.map((candidato, index) => (
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
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleDeseleccionarCandidato()
                                    }
                                    className="cursor-pointer"
                                  >
                                    <UserRoundX className="h-4 w-4 mr-2" />
                                    Deseleccionar
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleMarkCandidateAsContratado(
                                        candidato.id
                                      );
                                    }}
                                    className="cursor-pointer"
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
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                  onClick={() => handleEditCandidate(candidato)}
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
                          {user_logged.role === Role.Admin && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="mt-4"
                                >
                                  <FileCheck2 className="h-4 w-4 mr-2 text-green-500" />
                                  {candidato.IsCandidateValidated
                                    ? "Candidato validado"
                                    : "Validar candidato"}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="z-[9999]">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Validar candidato
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción permitirá que la vacante pueda
                                    actualizarce.
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
                          <CandidateSheetDetails candidate={candidato} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
    </div>
  );
};
