"use client";

import { createLeadHistory } from "@/actions/leads/history/actions";
import { ToastCustomMessage } from "@/components/ToastCustomMessage";
import { AlertDialogAction } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { LeadStatus } from "@prisma/client";
import { DialogClose } from "@radix-ui/react-dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  leadId: string;
}

export const AddHistoryDialog = ({ isOpen, leadId, setIsOpen }: Props) => {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<{ status: LeadStatus; createdAt: string }>();

  const onSubmit = async (data: { status: LeadStatus; createdAt: string }) => {
    try {
      //hacer el llamado a la accion

      const dataToSend = {
        leadId,
        status: data.status as LeadStatus,
        changedAt: new Date(data.createdAt),
      };

      const response = await createLeadHistory(dataToSend);
      if (!response.ok) {
        toast.custom((t) => (
          <ToastCustomMessage
            message="Error al editar el historial del lead"
            type="error"
            onClick={() => toast.dismiss(t)}
            title="error"
          />
        ));
        return;
      }

      toast.custom((t) => (
        <ToastCustomMessage
          message="Historial del lead creado correctamente. Reinicia la Aplicación para ver los cambios."
          type="success"
          onClick={() => toast.dismiss(t)}
          title="Accion realizada correctamente"
        />
      ));
    } catch (e) {
      toast.custom((t) => (
        <ToastCustomMessage
          message="Selecciona un historial para editar"
          type="error"
          onClick={() => toast.dismiss(t)}
          title="Error"
        />
      ));
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="z-50">
          <DialogHeader>
            <DialogTitle>Agregar Historial</DialogTitle>
            <DialogDescription>
              Al agregar historial manualmente, el resultado de los reportes se
              verá afectado.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-2">
              <Controller
                name="status"
                rules={{ required: "El estado es requerido" }}
                control={control}
                render={({ field }) => (
                  <>
                    <Label>Status</Label>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona el status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Status</SelectLabel>
                          <SelectItem value={LeadStatus.Contacto}>
                            Contacto
                          </SelectItem>
                          <SelectItem value={LeadStatus.ContactoCalido}>
                            Contacto Calido
                          </SelectItem>
                          <SelectItem value={LeadStatus.CitaAgendada}>
                            Cita Agendada
                          </SelectItem>
                          <SelectItem value={LeadStatus.CitaAtendida}>
                            Cita Atendida
                          </SelectItem>
                          <SelectItem value={LeadStatus.CitaValidada}>
                            Cita Validada
                          </SelectItem>
                          <SelectItem value={LeadStatus.Asignadas}>
                            Asignadas
                          </SelectItem>
                          <SelectItem value={LeadStatus.StandBy}>
                            Stand By
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>

                    {errors.status && (
                      <p className="text-sm text-destructive">
                        {errors.status.message}
                      </p>
                    )}
                  </>
                )}
              />

              <Controller
                name="createdAt"
                control={control}
                rules={{ required: "La fecha y hora son requeridas" }}
                render={({ field }) => (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="date">Fecha de cambio</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "PPP", {
                              locale: es,
                            })
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={new Date(field.value)}
                          onSelect={(date) => {
                            field.onChange(date?.toISOString());
                          }}
                          locale={es}
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.createdAt && (
                      <p className="text-sm text-destructive">
                        {errors.createdAt.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            <DialogFooter className="mt-3">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="btn btn-outline"
                >
                  Cerrar
                </Button>
              </DialogClose>
              <Button type="submit" variant="default">
                {isSubmitting ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
