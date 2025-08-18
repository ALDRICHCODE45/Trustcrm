import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useFieldArray, Control } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { CompareChecklistForm } from "./CompareChecklistForm";

interface ChecklistFormProps {
  form: {
    control: Control<any>;
    register: any;
  };
}

export const ChecklistForm = ({ form }: ChecklistFormProps) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "requisitos",
  });

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
          <div className="space-y-4">
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
                    {...form.register(`requisitos.${index}.valor`)}
                    placeholder="Agregar Requisito"
                    type="text"
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* <CompareChecklistForm /> */}
    </div>
  );
};
