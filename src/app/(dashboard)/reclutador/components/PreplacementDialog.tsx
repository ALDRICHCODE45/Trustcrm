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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  salarioFinal: z.string().min(2, {
    message: "El salario final es requerido",
  }),
  fechaProximaEntrada: z.string().min(2, {
    message: "Fecha de proxima entrada es requerida",
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
      fechaProximaEntrada: "",
      salarioFinal: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("valores", { values });
    if (!activeVacanteId) {
      toast.custom((t) => (
        <ToastCustomMessage
          title="Error "
          message={"Id de la vacante no disponible"}
          type="error"
          onClick={() => {
            toast.dismiss(t);
          }}
        />
      ));
      form.reset();
      return;
    }

    try {
      const result = await updateSalarioFinalAndFechaProximaEntrada({
        vacancyId: activeVacanteId,
        salarioFinal: values.salarioFinal,
        fechaProximaEntrada: values.fechaProximaEntrada,
      });
      if (!result.ok) {
        toast.custom((t) => (
          <ToastCustomMessage
            title="Error al actualizar el salario final y la fecha de proxima entrada"
            message={
              result.message ||
              "Error al actualizar el salario final y la fecha de proxima entrada"
            }
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
          title="Datos actualizados"
          message="Arrastra la tarjeta nuevamente para que se actualice al estado"
          type="success"
          onClick={() => {
            toast.dismiss(t);
          }}
        />
      ));
      form.reset();
      refreshVacancies();
      setOpen(false);
      return;
    } catch (e) {
      toast.custom((t) => (
        <ToastCustomMessage
          title="Error al actualizar el salario final y la fecha de proxima entrada"
          message={
            "Error al actualizar el salario final y la fecha de proxima entrada"
          }
          type="error"
          onClick={() => {
            toast.dismiss(t);
          }}
        />
      ));
      form.reset();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="z-[9999]">
        <DialogHeader>
          <DialogTitle>Completa los datos pendientes</DialogTitle>
          <DialogDescription>
            Completa los datos pendientes para que la vacante se pueda
            actualizar a preplacement.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="salarioFinal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salario final</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Ej: 10000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fechaProximaEntrada"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de proxima entrada</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Ej: 2025-01-01"
                        {...field}
                      />
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
