"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { es } from "date-fns/locale";
import { format } from "date-fns";

interface DatePickerCellProps {
  fecha: Date | null;
  onFechaChange: (nuevaFecha: Date) => void;
}

export const ChangeDateComponent = ({
  fecha,
  onFechaChange,
}: DatePickerCellProps) => {
  const [date, setDate] = useState<Date | undefined>(
    fecha instanceof Date ? fecha : undefined
  );
  const [tempDate, setTempDate] = useState<Date | undefined>(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCalendarSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setTempDate(selectedDate);
      setDialogOpen(true); // Mostrar el AlertDialog solo al seleccionar una fecha
    }
  };

  const handleConfirmDate = () => {
    if (tempDate) {
      setDate(tempDate);
      onFechaChange(tempDate);
      setDialogOpen(false);
      setTempDate(undefined);
    }
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setTempDate(undefined);
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center justify-center w-full"
          >
            {fecha instanceof Date ? (
              <span>{format(fecha, "EEE dd/MM/yy", { locale: es })}</span>
            ) : (
              <span className="text-red-500">N/A</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-50" align="start">
          <Calendar
            mode="single"
            selected={tempDate ?? date}
            onSelect={handleCalendarSelect}
            locale={es}
            captionLayout="dropdown"
          />
        </PopoverContent>
      </Popover>

      <AlertDialog open={dialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Estás seguro de cambiar la fecha?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción actualizará la fecha seleccionada. ¿Deseas continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDate}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
