import {
  addCandidateFeedback,
  editCandidateFeedback,
} from "@/actions/vacantes/checklist/actions";
import { VacancyWithRelations } from "@/app/(dashboard)/reclutador/components/ReclutadorColumns";
import { ToastCustomMessage } from "@/components/ToastCustomMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { UserCheck, Edit3, ListChecks } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Prisma } from "@prisma/client";

type VacancyWithChecklistAndFeedback = Prisma.VacancyGetPayload<{
  include: {
    InputChecklist: {
      include: {
        InputChecklistFeedback: {
          include: {
            candidate: true;
          };
        };
      };
    };
    reclutador: true;
    cliente: true;
    candidatoContratado: {
      include: {
        cv: true;
        vacanciesContratado: true;
      };
    };
    ternaFinal: {
      include: {
        cv: true;
        vacanciesContratado: true;
      };
    };
    files: true;
    Comments: {
      include: {
        author: true;
      };
    };
  };
}>;

interface Props {
  vacante: VacancyWithChecklistAndFeedback;
  refreshCandidates: () => void;
  candidateId: string;
}

interface ValidationFormData {
  validaciones: {
    requisitoId: string;
    feedback: string;
    candidateId: string;
  }[];
}

interface EditValidationFormData {
  ediciones: { requisitoId: string; feedback: string; candidateId: string }[];
}

export const CompareChecklistForm = ({
  vacante,
  refreshCandidates,
  candidateId,
}: Props) => {
  // Separar requisitos con y sin feedback para el candidato específico
  const requisitosConFeedback = vacante.InputChecklist.filter((item) =>
    item.InputChecklistFeedback.some(
      (feedback) => feedback.candidateId === candidateId
    )
  );

  const validacionesSinFeedback = vacante.InputChecklist.filter(
    (item) =>
      !item.InputChecklistFeedback.some(
        (feedback) => feedback.candidateId === candidateId
      )
  );

  // Formulario para nuevos feedbacks (requisitos sin feedback)
  const {
    control: controlNuevos,
    handleSubmit: handleSubmitNuevos,
    register: registerNuevos,
    reset: resetNuevos,
  } = useForm<ValidationFormData>({
    defaultValues: {
      validaciones: validacionesSinFeedback.map((item) => ({
        requisitoId: item.id,
        feedback: "",
        candidateId: candidateId,
      })),
    },
  });

  // Formulario para editar feedbacks existentes
  const {
    control: controlEditar,
    handleSubmit: handleSubmitEditar,
    register: registerEditar,
    reset: resetEditar,
  } = useForm<EditValidationFormData>({
    defaultValues: {
      ediciones: requisitosConFeedback.map((item) => {
        const feedback = item.InputChecklistFeedback.find(
          (f) => f.candidateId === candidateId
        );
        return {
          requisitoId: item.id,
          feedback: feedback?.feedback || "",
          candidateId: candidateId,
        };
      }),
    },
  });

  // Función para agregar nuevos feedbacks
  const handleValidationSubmit = async (data: ValidationFormData) => {
    const validacionesConFeedback = data.validaciones.filter(
      (validacion) => validacion.feedback.trim().length > 0
    );

    if (validacionesConFeedback.length === 0) {
      toast.custom((t) => (
        <ToastCustomMessage
          title="Error"
          message="No se puede agregar un feedback vacío"
          type="error"
          onClick={() => {
            toast.dismiss(t);
          }}
        />
      ));
      return;
    }

    console.log("Datos de validación (NUEVOS):", validacionesConFeedback);

    try {
      console.log("Datos de validación (NUEVOS):", validacionesConFeedback);
      const response = await addCandidateFeedback(
        validacionesConFeedback.map((item) => ({
          feedback: item.feedback,
          candidateId: item.candidateId,
          inputChecklistId: item.requisitoId,
        }))
      );
      if (!response.ok) {
        toast.custom((t) => (
          <ToastCustomMessage
            title="Error"
            message="Error al agregar el feedback del candidato"
            type="error"
            onClick={() => {
              toast.dismiss(t);
            }}
          />
        ));
        return;
      }
      toast.custom((t) => (
        <ToastCustomMessage
          title="Success"
          message="Feedback del candidato agregado correctamente"
          type="success"
          onClick={() => {
            toast.dismiss(t);
          }}
        />
      ));
      refreshCandidates();
    } catch (e) {
      toast.custom((t) => {
        return (
          <ToastCustomMessage
            title="Error"
            message="Error al agregar el feedback del candidato"
            type="error"
            onClick={() => {
              toast.dismiss(t);
            }}
          />
        );
      });
    }
  };

  // Función para editar feedbacks existentes
  const handleEditValidationSubmit = async (data: EditValidationFormData) => {
    const edicionesConCambios = data.ediciones.filter(
      (edicion) => edicion.feedback.trim().length > 0
    );

    if (edicionesConCambios.length === 0) {
      toast.custom((t) => (
        <ToastCustomMessage
          title="Error"
          message="No hay cambios para guardar"
          type="error"
          onClick={() => {
            toast.dismiss(t);
          }}
        />
      ));
      return;
    }

    try {
      // Actualizar cada feedback existente
      for (const edicion of edicionesConCambios) {
        const inputChecklist = vacante.InputChecklist.find(
          (item) => item.id === edicion.requisitoId
        );
        const existingFeedback = inputChecklist?.InputChecklistFeedback.find(
          (f) => f.candidateId === candidateId
        );

        if (existingFeedback) {
          await editCandidateFeedback(existingFeedback.id, edicion.feedback);
        }
      }

      toast.custom((t) => (
        <ToastCustomMessage
          title="Éxito"
          message="Feedback actualizado correctamente"
          type="success"
          onClick={() => {
            toast.dismiss(t);
          }}
        />
      ));

      refreshCandidates();
    } catch (error) {
      toast.custom((t) => (
        <ToastCustomMessage
          title="Error"
          message="Error al actualizar el feedback"
          type="error"
          onClick={() => {
            toast.dismiss(t);
          }}
        />
      ));
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild className="mt-4">
        <Button variant="outline" size="sm">
          <ListChecks />
          <span>Checklist (Comparar)</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[40vw] z-[999999999] min-h-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Comparación Requisitos vs Candidato</SheetTitle>
          <SheetDescription>
            Compara los requisitos de la vacante con los datos del candidato.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-8">
          {/* Sección 1: Requisitos CON feedback (para editar) */}
          {requisitosConFeedback.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                Requisitos con Feedback Existente
              </h3>

              <form onSubmit={handleSubmitEditar(handleEditValidationSubmit)}>
                <div className="grid grid-cols-2 gap-8 mb-6">
                  {/* Columna 1: Requisitos */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-muted-foreground">
                      Requisitos
                    </h4>
                    {requisitosConFeedback.map((item, index) => (
                      <div key={item.id} className="grid gap-3">
                        <Label htmlFor={`req-edit-${item.id}`}>
                          Requisito {index + 1}
                        </Label>
                        <Input
                          id={`req-edit-${item.id}`}
                          defaultValue={item.content}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Columna 2: Feedback para editar */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-muted-foreground">
                      Feedback (Editar)
                    </h4>
                    {requisitosConFeedback.map((item, index) => (
                      <div key={item.id} className="grid gap-3">
                        <Label htmlFor={`edit-${item.id}`}>
                          Editar Feedback {index + 1}
                        </Label>
                        <Input
                          id={`edit-${item.id}`}
                          {...registerEditar(`ediciones.${index}.feedback`)}
                          placeholder="Editar feedback existente..."
                          type="text"
                        />
                        {/* Campo oculto para el requisitoId */}
                        <input
                          type="hidden"
                          {...registerEditar(`ediciones.${index}.requisitoId`)}
                          value={item.id}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end mb-6">
                  <Button type="submit" variant="secondary">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Actualizar Feedback
                  </Button>
                </div>
              </form>

              <Separator className="my-6" />
            </div>
          )}

          {/* Sección 2: Requisitos SIN feedback (para agregar) */}
          {validacionesSinFeedback.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Agregar Feedback a Requisitos
              </h3>

              <form onSubmit={handleSubmitNuevos(handleValidationSubmit)}>
                <div className="grid grid-cols-2 gap-8 mb-6">
                  {/* Columna 1: Requisitos */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-muted-foreground">
                      Requisitos
                    </h4>
                    {validacionesSinFeedback.map((item, index) => (
                      <div key={item.id} className="grid gap-3">
                        <Label htmlFor={`req-new-${item.id}`}>
                          Requisito {index + 1}
                        </Label>
                        <Input
                          id={`req-new-${item.id}`}
                          defaultValue={item.content}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Columna 2: Nuevo feedback */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-muted-foreground">
                      Nuevo Feedback
                    </h4>
                    {validacionesSinFeedback.map((item, index) => (
                      <div key={item.id} className="grid gap-3">
                        <Label htmlFor={`validation-${item.id}`}>
                          Feedback para Requisito {index + 1}
                        </Label>
                        <Input
                          id={`validation-${item.id}`}
                          {...registerNuevos(`validaciones.${index}.feedback`)}
                          placeholder="Ej: El candidato cumple con este requisito porque..."
                          type="text"
                        />
                        {/* Campo oculto para el requisitoId */}
                        <input
                          type="hidden"
                          {...registerNuevos(
                            `validaciones.${index}.requisitoId`
                          )}
                          value={item.id}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Agregar Feedback
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Mensaje cuando no hay requisitos */}
          {requisitosConFeedback.length === 0 &&
            validacionesSinFeedback.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No hay requisitos disponibles para validar.</p>
              </div>
            )}
        </div>

        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cerrar</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
