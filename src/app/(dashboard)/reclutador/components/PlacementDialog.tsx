import { updateSalarioFinalAndFechaProximaEntrada } from "@/actions/vacantes/actions";
import { ToastCustomMessage } from "@/components/ToastCustomMessage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { VacancyEstado } from "@prisma/client";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  salarioFinal: z
    .string()
    .min(1, {
      message: "El salario final es requerido",
    })
    .regex(/^\d+$/, {
      message: "Solo se permiten números",
    }),
  monto: z.enum(["brutos", "netos"], {
    required_error: "Selecciona si el salario es bruto o neto",
    invalid_type_error: "Valor inválido, selecciona bruto o neto",
  }),
});

interface PlacementDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  activeVacanteId: string;
  refreshVacancies: () => void;
}

export const PlacementDialog = ({
  open,
  setOpen,
  activeVacanteId,
  refreshVacancies,
}: PlacementDialogProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      salarioFinal: "",
      monto: "brutos",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!activeVacanteId) {
      toast.custom((t) => (
        <ToastCustomMessage
          title="Error"
          message="ID de la vacante no disponible"
          type="error"
          onClick={() => {
            toast.dismiss(t);
          }}
        />
      ));
      return;
    }

    try {
      toast.promise(
        updateSalarioFinalAndFechaProximaEntrada({
          vacancyId: activeVacanteId,
          salarioFinal: `${values.salarioFinal} ${values.monto}`,
          newState: VacancyEstado.Placement,
        }),
        {
          loading: "Guardando cambios...",
          success: (result) => {
            if (!result.ok) {
              throw new Error(
                result.message || "Error al actualizar el salario final"
              );
            }
            // Cerrar el diálogo y resetear el formulario solo si fue exitoso
            form.reset();
            refreshVacancies();
            setOpen(false);
            return "Datos actualizados correctamente. La vacante se ha movido a Placement.";
          },
          error: (error) => {
            return error.message || "Error al actualizar el salario final";
          },
        }
      );
    } catch (error) {
      console.error("Error al actualizar:", error);
      // El error ya fue manejado por el toast.promise
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="z-[9999]">
        <DialogHeader>
          <DialogTitle>Completa los datos pendientes</DialogTitle>
          <DialogDescription>
            Ingresa el salario final para mover la vacante a Placement.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-4">
              <div className="flex justify-between items-center gap-2">
                <FormField
                  control={form.control}
                  name="salarioFinal"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Salario final *</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder="Ej: 10000"
                          {...field}
                          onChange={(e) => {
                            // Solo permitir números
                            const value = e.target.value.replace(/\D/g, "");
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="monto"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Tipo de monto *</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona tipo" />
                          </SelectTrigger>
                          <SelectContent className="z-[99999]">
                            <SelectItem value="brutos">Brutos</SelectItem>
                            <SelectItem value="netos">Netos</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
