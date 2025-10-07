"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Edit } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/core/lib/utils";
import { toast } from "sonner";
import { TaskWithUsers } from "./TaskKanbanBoard";
import { ToastCustomMessage } from "@/components/ToastCustomMessage";

interface EditData {
  title?: string;
  description?: string;
  dueDate?: Date;
}

interface Props {
  taskId: string;
  onEdit: (id: string, EditData: EditData) => void;
  activity: TaskWithUsers;
}

export const EditTaskDialog = ({ taskId, onEdit, activity }: Props) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(activity.title || "");
  const [description, setDescription] = useState(activity.description || "");
  const [date, setDate] = useState<Date | undefined>(
    new Date(activity.dueDate) || new Date()
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!title.trim()) {
      toast.custom((t) => (
        <ToastCustomMessage
          title="Error"
          message="Por favor añade un título para la tarea"
          type="error"
          onClick={() => toast.dismiss(t)}
        />
      ));
      setIsSubmitting(false);
      return;
    }

    if (!description.trim()) {
      toast.custom((t) => (
        <ToastCustomMessage
          title="Error"
          message="Por favor añade una descripción para la tarea"
          type="error"
          onClick={() => toast.dismiss(t)}
        />
      ));
      setIsSubmitting(false);
      return;
    }

    if (!date) {
      toast.custom((t) => (
        <ToastCustomMessage
          title="Error"
          message="Por favor, selecciona una fecha límite"
          type="error"
          onClick={() => toast.dismiss(t)}
        />
      ));
      setIsSubmitting(false);
      return;
    }

    try {
      onEdit(taskId, { description, title, dueDate: date });

      // Limpiar el formulario
      setTitle("");
      setDescription("");
      setDate(new Date());
      setOpen(false);
    } catch (error) {
      // El error se maneja en onEdit
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reiniciar valores cuando se abre el dialog
  useEffect(() => {
    if (open) {
      setTitle(activity.title || "");
      setDescription(activity.description || "");
      setDate(new Date(activity.dueDate));
      setIsSubmitting(false);
    }
  }, [open, activity]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="w-full">
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          className="cursor-pointer"
        >
          <Edit className="opacity-60 mr-2" size={15} aria-hidden="true" />
          <span className="text-sm">Editar</span>
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-md z-[888]"
        aria-describedby="edit-dialog-description"
      >
        <DialogHeader>
          <DialogTitle>Editar tarea</DialogTitle>
          <DialogDescription id="edit-dialog-description">
            Modifica los campos que desees actualizar
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title" className="text-left">
                Título{" "}
                <span className="text-destructive" aria-label="Campo requerido">
                  *
                </span>
              </Label>
              <Input
                id="edit-title"
                placeholder="Ej: Terminar proyecto de React"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
                aria-required="true"
                aria-invalid={!title.trim() ? "true" : "false"}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-description" className="text-left">
                Descripción{" "}
                <span className="text-destructive" aria-label="Campo requerido">
                  *
                </span>
              </Label>
              <Textarea
                id="edit-description"
                placeholder="Describe los detalles de la tarea..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3 resize-none min-h-[80px]"
                aria-required="true"
                aria-invalid={!description.trim() ? "true" : "false"}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-dueDate" className="text-left">
                Fecha límite{" "}
                <span className="text-destructive" aria-label="Campo requerido">
                  *
                </span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="edit-dueDate"
                    variant="outline"
                    disabled={isSubmitting}
                    className={cn(
                      "justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                    aria-expanded="false"
                    aria-haspopup="dialog"
                    aria-label={
                      date
                        ? `Fecha seleccionada: ${format(
                            date,
                            "d 'de' MMMM, yyyy",
                            { locale: es }
                          )}`
                        : "Seleccionar fecha límite"
                    }
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                    {date ? (
                      format(date, "d 'de' MMMM, yyyy", { locale: es })
                    ) : (
                      <span>Selecciona una fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[900]">
                  <Calendar
                    mode="single"
                    captionLayout="dropdown"
                    selected={date}
                    onSelect={handleDateSelect}
                    locale={es}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting || !title.trim() || !description.trim() || !date
              }
            >
              {isSubmitting ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
