"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useState } from "react";
import { updateVacancy } from "@/actions/vacantes/actions";
import { toast } from "sonner";
import { ToastCustomMessage } from "@/components/ToastCustomMessage";
import { VacancyWithRelations } from "../../components/ReclutadorColumns";
import { Separator } from "@/components/ui/separator";
import { Save, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// Esquema de validación para los detalles de la vacante
const vacancyDetailsSchema = z.object({
  prestaciones: z.string().optional(),
  herramientas: z.string().optional(),
  comisiones: z.string().optional(),
  modalidad: z.string().optional(),
  horario: z.string().optional(),
  psicometria: z.string().optional(),
  ubicacion: z.string().optional(),
  comentarios: z.string().optional(),
  salario: z
    .number()
    .min(0, "El salario debe ser mayor o igual a 0")
    .optional(),
});

type VacancyDetailsFormData = z.infer<typeof vacancyDetailsSchema>;

interface VacancyDetailsFormProps {
  vacante: VacancyWithRelations;
  isEditing: boolean;
  onEditingChange: (editing: boolean) => void;
  onVacancyUpdated: () => Promise<void>;
}

export const VacancyDetailsForm = ({
  vacante,
  isEditing,
  onEditingChange,
  onVacancyUpdated,
}: VacancyDetailsFormProps) => {
  const [loading, setLoading] = useState(false);

  const form = useForm<VacancyDetailsFormData>({
    resolver: zodResolver(vacancyDetailsSchema),
    defaultValues: {
      prestaciones: vacante.prestaciones || "",
      herramientas: vacante.herramientas || "",
      comisiones: vacante.comisiones || "",
      modalidad: vacante.modalidad || "",
      horario: vacante.horario || "",
      psicometria: vacante.psicometria || "",
      ubicacion: vacante.ubicacion || "",
      comentarios: vacante.comentarios || "",
      salario: vacante.salario || undefined,
    },
  });

  const details = [
    {
      label: "Salario (bruto)",
      name: "salario" as const,
      value: vacante.salario || "No especificado",
    },
    {
      label: "Prestaciones",
      name: "prestaciones" as const,
      value: vacante.prestaciones,
    },
    {
      label: "Herramientas de trabajo",
      name: "herramientas" as const,
      value: vacante.herramientas,
    },
    {
      label: "Comisiones/Bonos",
      name: "comisiones" as const,
      value: vacante.comisiones,
    },
    {
      label: "Modalidad",
      name: "modalidad" as const,
      value: vacante.modalidad,
    },
    { label: "Horario", name: "horario" as const, value: vacante.horario },
    {
      label: "Psicometria",
      name: "psicometria" as const,
      value: vacante.psicometria,
    },
    {
      label: "Ubicacion",
      name: "ubicacion" as const,
      value: vacante.ubicacion,
    },
    {
      label: "Comentarios",
      name: "comentarios" as const,
      value: vacante.comentarios,
    },
  ];

  const onSubmit = async (data: VacancyDetailsFormData) => {
    setLoading(true);
    try {
      const updateData = {
        id: vacante.id,
        ...data,
      };

      const result = await updateVacancy(updateData);

      if (!result.ok) {
        toast.custom((t) => (
          <ToastCustomMessage
            title="Error"
            message={result.message || "Error al actualizar los detalles"}
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
          title="Detalles actualizados"
          message="Los detalles de la vacante se han actualizado correctamente"
          type="success"
          onClick={() => {
            toast.dismiss(t);
          }}
        />
      ));
      onEditingChange(false);
      onVacancyUpdated();
    } catch (error) {
      console.error("Error al actualizar los detalles:", error);
      toast.custom((t) => (
        <ToastCustomMessage
          title="Error"
          message="Error al actualizar los detalles"
          type="error"
          onClick={() => {
            toast.dismiss(t);
          }}
        />
      ));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onEditingChange(false);
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 px-1  max-h-[70vh]">
        <div className="space-y-4 pb-6">
          {details.map((detail, index) => (
            <div key={detail.label}>
              <div className="flex items-start justify-between py-3">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {detail.label}
                  </h4>
                  {isEditing ? (
                    <Form {...form}>
                      <FormField
                        control={form.control}
                        name={detail.name}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              {detail.name === "comentarios" ? (
                                <Textarea
                                  placeholder={`Ingresa ${detail.label.toLowerCase()}`}
                                  className="w-full min-h-[80px]"
                                  autoComplete="off"
                                  {...field}
                                />
                              ) : detail.name === "salario" ? (
                                <Input
                                  placeholder={`Ingresa ${detail.label.toLowerCase()}`}
                                  className="w-full"
                                  autoComplete="off"
                                  value={field.value || ""}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(
                                      value === "" ? 0 : Number(value)
                                    );
                                  }}
                                />
                              ) : (
                                <Input
                                  placeholder={`Ingresa ${detail.label.toLowerCase()}`}
                                  className="w-full"
                                  autoComplete="off"
                                  {...field}
                                />
                              )}
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </Form>
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-gray-800 p-3 rounded-md min-h-[40px]">
                      {detail.value || "No especificado"}
                    </p>
                  )}
                </div>
              </div>
              {index < details.length - 1 && <Separator />}
            </div>
          ))}
        </div>
      </ScrollArea>

      {isEditing && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="pt-4 flex-shrink-0">
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <X size={16} />
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Save size={16} />
                  {loading ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};
