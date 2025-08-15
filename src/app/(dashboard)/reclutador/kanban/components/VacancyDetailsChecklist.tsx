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
import { Plus, Trash2 } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  createChecklist,
  deleteChecklist,
} from "@/actions/vacantes/checklist/actions";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogFooter,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogTrigger,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ToastCustomMessage } from "@/components/ToastCustomMessage";

interface Props {
  vacante: VacancyWithRelations;
  onSaveRequisitos: () => void;
}

interface ChecklistFormData {
  nuevosRequisitos: { valor: string }[];
}

export const VacancyDetailsChecklist = ({
  vacante,
  onSaveRequisitos,
}: Props) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);

  // Inicializar el formulario solo para nuevos requisitos
  const { control, handleSubmit, reset } = useForm<ChecklistFormData>({
    defaultValues: {
      nuevosRequisitos: [],
    },
  });

  const { fields, remove, append } = useFieldArray({
    control,
    name: "nuevosRequisitos",
  });

  const handleFormSubmit = async (data: ChecklistFormData) => {
    // Filtrar requisitos vacíos y extraer solo los valores
    const requisitosLimpios = data.nuevosRequisitos
      .map((req) => req.valor.trim())
      .filter((req) => req.length > 0);

    if (requisitosLimpios.length === 0) {
      toast.custom((t) => {
        return (
          <ToastCustomMessage
            title="Sin requisitos nuevos"
            message="No hay requisitos nuevos para agregar"
            type="info"
            onClick={() => {
              toast.dismiss(t);
            }}
          />
        );
      });
      return;
    }

    console.log({ requisitosLimpios, vacanteId: vacante.id });

    try {
      //llamar a la funcion para crear los requisitos
      await createChecklist(vacante.id, requisitosLimpios);

      toast.custom((t) => {
        return (
          <ToastCustomMessage
            title="Requisitos agregados"
            message="Los nuevos requisitos se han agregado correctamente"
            type="success"
            onClick={() => {
              toast.dismiss(t);
            }}
          />
        );
      });

      //Refrescar los requisitos
      onSaveRequisitos();
      // Limpiar el formulario después de guardar
      reset();
    } catch (error) {
      toast.custom((t) => {
        return (
          <ToastCustomMessage
            title="Error al agregar requisitos"
            message="No se pudieron agregar los nuevos requisitos"
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

        {/* Sección de requisitos existentes - FUERA del formulario */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">Requisitos existentes</h3>
          <div className="grid auto-rows-min gap-4 max-h-[40vh] overflow-y-auto">
            {vacante.InputChecklist.length > 0 ? (
              vacante.InputChecklist.map((item, index) => (
                <div key={item.id} className="grid gap-3 mr-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`existente-${index}`}>
                      Requisito {index + 1}
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsDeleteDialogOpen(true);
                        setIdToDelete(item.id);
                      }}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    id={`existente-${index}`}
                    value={item.content}
                    readOnly
                    placeholder="Requisito existente"
                    type="text"
                    className="bg-muted"
                  />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No hay requisitos existentes
              </p>
            )}
          </div>
        </div>

        <Separator orientation="horizontal" className="mb-4" />

        {/* Formulario para nuevos requisitos */}
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex flex-col h-full"
        >
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-3">
              Agregar nuevos requisitos
            </h3>
            <div className="grid auto-rows-min gap-4 max-h-[30vh] overflow-y-auto">
              {fields.map((field, index) => (
                <div key={field.id} className="grid gap-3 mr-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`nuevo-${index}`}>
                      Nuevo requisito {index + 1}
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => eliminarRequisito(index)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    id={`nuevo-${index}`}
                    {...control.register(`nuevosRequisitos.${index}.valor`)}
                    placeholder="Escribir nuevo requisito"
                    type="text"
                  />
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full mt-4"
              onClick={agregarRequisito}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar requisito
            </Button>
          </div>

          <SheetFooter className="mt-auto px-4">
            {fields.length > 0 && (
              <Button type="submit">Guardar nuevos requisitos</Button>
            )}
            <SheetClose asChild>
              <Button variant="outline">Cerrar</Button>
            </SheetClose>
          </SheetFooter>
        </form>

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
