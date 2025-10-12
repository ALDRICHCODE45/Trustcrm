import { updateSalarioFinalAndFechaProximaEntrada } from "@/actions/vacantes/actions";
import { ToastCustomMessage } from "@/components/ToastCustomMessage";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { VacancyEstado } from "@prisma/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
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
  fechaProximaEntrada: z.date({
    required_error: "Selecciona una fecha",
    invalid_type_error: "Fecha inválida",
  }),
  monto: z.enum(["brutos", "netos"], {
    required_error: "Selecciona si el salario es bruto o neto",
    invalid_type_error: "Valor inválido, selecciona bruto o neto",
  }),
});

interface PreplacementDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  activeVacanteId: string;
  refreshVacancies: () => void;
}

export const PreplacementDialog = ({
  open,
  setOpen,
  activeVacanteId,
  refreshVacancies,
}: PreplacementDialogProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fechaProximaEntrada: undefined,
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
          fechaProximaEntrada: values.fechaProximaEntrada,
          newState: VacancyEstado.PrePlacement,
        }),
        {
          loading: "Guardando cambios...",
          success: (result) => {
            if (!result.ok) {
              throw new Error(
                result.message ||
                  "Error al actualizar el salario final y la fecha de próxima entrada"
              );
            }
            // Cerrar el diálogo y resetear el formulario solo si fue exitoso
            form.reset();
            refreshVacancies();
            setOpen(false);
            return "Datos actualizados correctamente. Refresca la pagina para actualizar el estado.";
          },
          error: (error) => {
            return (
              error.message ||
              "Error al actualizar el salario final y la fecha de próxima entrada"
            );
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
            Ingresa el salario final y la fecha de próxima entrada para mover la
            vacante a Pre-Placement.
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
              <FormField
                control={form.control}
                name="fechaProximaEntrada"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de próxima entrada *</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={`
                              w-full justify-start text-left font-normal
                              ${!field.value ? "text-muted-foreground" : ""}
                            `}
                          >
                            {field.value
                              ? format(field.value, "eee d 'de' MMM yyyy", {
                                  locale: es,
                                })
                              : "Selecciona la fecha"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 z-[99999]" align="start">
                          <Calendar
                            mode="single"
                            captionLayout="dropdown"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                            }}
                            locale={es}
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
