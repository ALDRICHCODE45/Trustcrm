import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm, useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { CompareChecklistForm } from "./CompareChecklistForm";

interface ChecklistFormData {
  requisitos: { valor: string }[];
}

interface ChecklistFormProps {
  onSubmit?: (requisitos: string[]) => void;
  initialData?: string[];
}

export const ChecklistForm = ({
  onSubmit,
  initialData = [],
}: ChecklistFormProps) => {
  const { control, handleSubmit, watch } = useForm<ChecklistFormData>({
    defaultValues: {
      requisitos:
        initialData.length > 0
          ? initialData.map((req) => ({ valor: req }))
          : [{ valor: "" }], // Al menos un campo inicial
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "requisitos",
  });

  const handleFormSubmit = (data: ChecklistFormData) => {
    // Filtrar requisitos vacíos y extraer solo los valores
    const requisitosLimpios = data.requisitos
      .map((req) => req.valor.trim())
      .filter((req) => req.length > 0);

    onSubmit?.(requisitosLimpios);
  };

  const agregarRequisito = () => {
    append({ valor: "" });
  };

  const eliminarRequisito = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <div className="min-w-full min-h-full">
      <Card>
        <CardContent className="mt-5">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Requisitos de la Vacante</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={agregarRequisito}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Agregar Requisito
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
              {fields.map((field, index) => (
                <div key={field.id} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`requisito-${index}`}>
                      Requisito {index + 1}
                    </Label>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => eliminarRequisito(index)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <Input
                    id={`requisito-${index}`}
                    {...control.register(`requisitos.${index}.valor`)}
                    placeholder="Agregar Requisito"
                    type="text"
                  />
                </div>
              ))}
            </div>

            {onSubmit && (
              <div className="flex justify-end pt-4 border-t">
                <Button type="submit">Guardar Requisitos</Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
      {/* <CompareChecklistForm /> */}
    </div>
  );
};
