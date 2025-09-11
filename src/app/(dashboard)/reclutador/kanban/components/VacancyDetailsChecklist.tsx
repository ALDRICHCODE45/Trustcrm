"use client";
import {
  SheetContent,
  SheetTitle,
  SheetHeader,
  SheetDescription,
  SheetClose,
  SheetFooter,
} from "@/components/ui/sheet";
import { VacancyWithRelations } from "../../components/ReclutadorColumns";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MailCheck, Plus, Trash2, Save, AlertCircle } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  completeChecklistAndNotify,
  createChecklist,
  deleteChecklist,
  updateChecklist,
} from "@/actions/vacantes/checklist/actions";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogFooter,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ToastCustomMessage } from "@/components/ToastCustomMessage";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface Props {
  vacante: VacancyWithRelations;
  onSaveRequisitos: () => void;
}

interface ChecklistFormData {
  nuevosRequisitos: { valor: string }[];
}

interface ExistingChecklistFormData {
  requisitosExistentes: { dbId: string; valor: string }[];
}

export const VacancyDetailsChecklist = ({
  vacante,
  onSaveRequisitos,
}: Props) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);
  const [isSubmittingExisting, setIsSubmittingExisting] = useState(false);

  // Formulario para requisitos existentes
  const {
    control: existingControl,
    handleSubmit: handleExistingSubmit,
    reset: resetExisting,
    getValues: getExistingValues,
  } = useForm<ExistingChecklistFormData>({
    defaultValues: {
      requisitosExistentes: [],
    },
  });

  const { fields: existingFields, remove: removeExisting } = useFieldArray({
    control: existingControl,
    name: "requisitosExistentes",
  });

  // Inicializar formulario de requisitos existentes cuando cambie la vacante
  useEffect(() => {
    const existingRequisitos = vacante.InputChecklist.map((item) => ({
      dbId: item.id,
      valor: item.content,
    }));
    resetExisting({
      requisitosExistentes: existingRequisitos,
    });
  }, [vacante.InputChecklist, resetExisting]);

  // Formulario para nuevos requisitos
  const { control, handleSubmit, reset } = useForm<ChecklistFormData>({
    defaultValues: {
      nuevosRequisitos: [],
    },
  });

  const { fields, remove, append } = useFieldArray({
    control,
    name: "nuevosRequisitos",
  });

  const handleExistingFormSubmit = async (data: ExistingChecklistFormData) => {
    setIsSubmittingExisting(true);

    try {
      // Actualizar cada requisito existente
      const updatePromises = data.requisitosExistentes.map((req) =>
        updateChecklist(req.dbId, req.valor.trim())
      );

      const responses = await Promise.all(updatePromises);

      // Verificar si alguna actualización falló
      const failedUpdates = responses.filter((response) => !response.ok);

      if (failedUpdates.length > 0) {
        toast.custom((t) => {
          return (
            <ToastCustomMessage
              title="Error al actualizar algunos requisitos"
              message="Algunos requisitos no se pudieron actualizar correctamente"
              type="error"
              onClick={() => {
                toast.dismiss(t);
              }}
            />
          );
        });
        return;
      }

      toast.custom((t) => {
        return (
          <ToastCustomMessage
            title="¡Cambios guardados!"
            message="Todos los requisitos se han actualizado correctamente"
            type="success"
            onClick={() => {
              toast.dismiss(t);
            }}
          />
        );
      });

      onSaveRequisitos?.();
    } catch (error) {
      toast.custom((t) => {
        return (
          <ToastCustomMessage
            title="Error al actualizar requisitos"
            message="No se pudieron actualizar los requisitos. Intenta de nuevo."
            type="error"
            onClick={() => {
              toast.dismiss(t);
            }}
          />
        );
      });
    } finally {
      setIsSubmittingExisting(false);
    }
  };

  const handleFormSubmit = async (data: ChecklistFormData) => {
    setIsSubmittingNew(true);

    // Filtrar requisitos vacíos y extraer solo los valores
    const requisitosLimpios = data.nuevosRequisitos
      .map((req) => req.valor.trim())
      .filter((req) => req.length > 0);

    if (requisitosLimpios.length === 0) {
      toast.custom((t) => {
        return (
          <ToastCustomMessage
            title="Sin requisitos nuevos"
            message="Agrega al menos un requisito antes de guardar"
            type="info"
            onClick={() => {
              toast.dismiss(t);
            }}
          />
        );
      });
      setIsSubmittingNew(false);
      return;
    }

    try {
      //llamar a la funcion para crear los requisitos
      await createChecklist(vacante.id, requisitosLimpios);

      //Refrescar los requisitos
      onSaveRequisitos();

      toast.custom((t) => {
        return (
          <ToastCustomMessage
            title="¡Requisitos guardados!"
            message={`Se ${
              requisitosLimpios.length === 1 ? "agregó" : "agregaron"
            } ${requisitosLimpios.length} requisito${
              requisitosLimpios.length === 1 ? "" : "s"
            } correctamente`}
            type="success"
            onClick={() => {
              toast.dismiss(t);
            }}
          />
        );
      });

      // Limpiar el formulario después de guardar
      reset();
    } catch (error) {
      toast.custom((t) => {
        return (
          <ToastCustomMessage
            title="Error al guardar requisitos"
            message="No se pudieron guardar los nuevos requisitos. Intenta de nuevo."
            type="error"
            onClick={() => {
              toast.dismiss(t);
            }}
          />
        );
      });
    } finally {
      setIsSubmittingNew(false);
    }
  };

  const handleCompleteChecklistAndNotify = async () => {
    try {
      await completeChecklistAndNotify(vacante.id);
      toast.custom((t) => {
        return (
          <ToastCustomMessage
            title="Checklist completado y notificado"
            message="El checklist se ha completado y notificado correctamente"
            type="success"
            onClick={() => {
              toast.dismiss(t);
            }}
          />
        );
      });
    } catch (error) {
      toast.custom((t) => {
        return (
          <ToastCustomMessage
            title="Error al completar el checklist y notificar"
            message="No se pudo completar el checklist y notificar"
            type="error"
            onClick={() => {
              toast.dismiss(t);
            }}
          />
        );
      });
    }
  };

  const agregarRequisito = () => {
    append({ valor: "" });
  };

  const eliminarRequisito = (index: number) => {
    remove(index);
  };

  const handleDeleteRequisitoFromDb = async () => {
    try {
      if (!idToDelete) return;

      //llamar a la funcion para eliminar el requisito
      const response = await deleteChecklist(idToDelete);

      if (!response.ok) {
        toast.custom((t) => {
          return (
            <ToastCustomMessage
              title="Error al eliminar el requisito"
              message="El requisito no se ha eliminado correctamente"
              type="error"
              onClick={() => {
                toast.dismiss(t);
              }}
            />
          );
        });
        return;
      }
      toast.custom((t) => {
        return (
          <ToastCustomMessage
            title="Requisito eliminado"
            message="El requisito se ha eliminado correctamente"
            type="success"
            onClick={() => {
              toast.dismiss(t);
              setIsDeleteDialogOpen(false);
              setIdToDelete(null);
            }}
          />
        );
      });
      //refrescar los requisitos
      onSaveRequisitos?.();
    } catch (e) {
      toast.custom((t) => {
        return (
          <ToastCustomMessage
            title="Error al eliminar el requisito"
            message="El requisito no se ha eliminado correctamente"
            type="error"
            onClick={() => {
              toast.dismiss(t);
            }}
          />
        );
      });
    }
  };

  const handleDeleteExistingRequisito = (index: number) => {
    // Obtener el ID de la base de datos desde el valor del formulario
    const formValue = getExistingValues(`requisitosExistentes.${index}`);
    setIdToDelete(formValue.dbId);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <SheetContent className="z-[9999] min-w-[25vw]">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-lg font-bold">Checklist</SheetTitle>
          <SheetDescription className="text-md text-muted-foreground">
            Requisitos para la vacante.
          </SheetDescription>
        </SheetHeader>
        <Separator orientation="horizontal" className="mb-2" />

        {/* Formulario para requisitos existentes */}
        {existingFields.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Requisitos existentes</h3>
              <Badge variant="outline" className="text-xs">
                {existingFields.length} requisito
                {existingFields.length === 1 ? "" : "s"}
              </Badge>
            </div>
            <form onSubmit={handleExistingSubmit(handleExistingFormSubmit)}>
              <div className="grid auto-rows-min gap-4 max-h-[40vh] overflow-y-auto mb-4">
                {existingFields.map((field, index) => (
                  <div key={field.id} className="grid gap-3 mr-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`existente-${index}`}>
                        Requisito {index + 1}
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteExistingRequisito(index)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      id={`existente-${index}`}
                      {...existingControl.register(
                        `requisitosExistentes.${index}.valor`
                      )}
                      placeholder="Requisito existente"
                      type="text"
                    />
                    {/* Campo oculto para almacenar el ID de la base de datos */}
                    <input
                      type="hidden"
                      {...existingControl.register(
                        `requisitosExistentes.${index}.dbId`
                      )}
                    />
                  </div>
                ))}
              </div>
              <Button
                type="submit"
                className="w-full mb-4"
                variant="default"
                disabled={isSubmittingExisting}
              >
                {isSubmittingExisting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar cambios
                  </>
                )}
              </Button>
            </form>
          </div>
        )}

        <Separator orientation="horizontal" className="mb-4" />

        {/* Formulario para nuevos requisitos */}
        <div className="flex flex-col h-full">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Agregar nuevos requisitos</h3>
              {fields.length > 0 && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-amber-100 text-amber-800 border-amber-200"
                >
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {fields.length} sin guardar
                </Badge>
              )}
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)}>
              {/* Lista de nuevos requisitos */}
              {fields.length > 0 ? (
                <div className="grid auto-rows-min gap-4 max-h-[25vh] overflow-y-auto mb-4 p-3 bg-slate-50 rounded-lg border">
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor={`nuevo-${index}`}
                          className="text-xs text-slate-600"
                        >
                          Nuevo requisito {index + 1}
                        </Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => eliminarRequisito(index)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <Input
                        id={`nuevo-${index}`}
                        {...control.register(`nuevosRequisitos.${index}.valor`)}
                        placeholder="Escribe el requisito aquí..."
                        type="text"
                        className="text-sm"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 text-center">
                    Haz clic en Agregar requisito para comenzar a añadir nuevos
                    requisitos a esta vacante.
                  </p>
                </div>
              )}

              {/* Botones de acción para nuevos requisitos */}
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={agregarRequisito}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar requisito
                </Button>

                {fields.length > 0 && (
                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isSubmittingNew}
                  >
                    {isSubmittingNew ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar {fields.length} requisito
                        {fields.length === 1 ? "" : "s"}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </div>

          <Separator orientation="horizontal" className="mb-4" />

          {/* Botón para notificar checklist completado */}
          <div className="mb-6">
            <ConfirmDialog
              title="Notificar Checklist Completado"
              description="¿Estás seguro de querer notificar el checklist completado?
              Se enviará un correo a los usuarioa administradores."
              trigger={
                <Button type="button" variant="outline" className="w-full">
                  <MailCheck className="h-4 w-4 mr-2" />
                  Notificar Checklist Completado
                </Button>
              }
              onConfirm={handleCompleteChecklistAndNotify}
            />
          </div>

          <SheetFooter className="mt-auto px-4 gap-2">
            <SheetClose asChild>
              <Button variant="outline" className="flex-1">
                Cerrar
              </Button>
            </SheetClose>
          </SheetFooter>
        </div>

        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent className="z-[9999]">
            <AlertDialogHeader>
              <AlertDialogTitle>
                ¿Estás seguro de querer eliminar este requisito?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará este requisito de
                la vacante.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleDeleteRequisitoFromDb()}>
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SheetContent>
    </>
  );
};
