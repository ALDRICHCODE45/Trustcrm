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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon, Plus, BellRing, X } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/core/lib/utils";
import { toast } from "sonner";
import { User } from "@prisma/client";
import { ToastCustomMessage } from "@/components/ToastCustomMessage";

interface Props {
  onAddActivity: (activity: {
    title: string;
    description: string;
    dueDate: Date;
    notifyOnComplete: boolean;
    notificationRecipients: string[];
  }) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddTaskDialog = ({
  onAddActivity,
  isOpen,
  onOpenChange,
}: Props) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!isOpen) return; // Solo cargar cuando se abre el dialog

      setIsLoadingUsers(true);
      try {
        const response = await fetch("/api/users");
        const data = await response.json();
        setUsers(data.users || []);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.custom((t) => (
          <ToastCustomMessage
            title="Error"
            message="Error al cargar usuarios"
            type="error"
            onClick={() => {
              toast.dismiss(t);
            }}
          />
        ));
      } finally {
        setIsLoadingUsers(false);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDate(new Date());
    setNotificationsEnabled(false);
    setSelectedUsers([]);
    setIsSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!title.trim()) {
      toast.custom((t) => (
        <ToastCustomMessage
          title="Error"
          message="Por favor, añade un título para la tarea"
          type="error"
          onClick={() => {
            toast.dismiss(t);
          }}
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
          onClick={() => {
            toast.dismiss(t);
          }}
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
          onClick={() => {
            toast.dismiss(t);
          }}
        />
      ));
      setIsSubmitting(false);
      return;
    }

    try {
      onAddActivity({
        title,
        description,
        dueDate: date,
        notifyOnComplete: notificationsEnabled,
        notificationRecipients: selectedUsers,
      });

      resetForm();
      onOpenChange(false);
    } catch (error) {
      // El error se maneja en onAddActivity
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const removeUser = (userIdToRemove: string) => {
    setSelectedUsers(selectedUsers.filter((id) => id !== userIdToRemove));
  };

  const canSubmit = title.trim() && description.trim() && date && !isSubmitting;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
          Nueva tarea
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-md z-[888]"
        aria-describedby="add-dialog-description"
      >
        <DialogHeader>
          <DialogTitle>Nueva tarea</DialogTitle>
          <DialogDescription id="add-dialog-description">
            Crea una nueva tarea para tu tablero Kanban.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-title" className="text-left">
                Título{" "}
                <span className="text-destructive" aria-label="Campo requerido">
                  *
                </span>
              </Label>
              <Input
                id="new-title"
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
              <Label htmlFor="new-description" className="text-left">
                Descripción{" "}
                <span className="text-destructive" aria-label="Campo requerido">
                  *
                </span>
              </Label>
              <Textarea
                id="new-description"
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
              <Label htmlFor="new-dueDate" className="text-left">
                Fecha límite{" "}
                <span className="text-destructive" aria-label="Campo requerido">
                  *
                </span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="new-dueDate"
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

            <div className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <div className="border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2">
                  <Switch
                    id="new-notifications"
                    className="order-1 h-4 w-6 after:absolute after:inset-0 [&_span]:size-3 data-[state=checked]:[&_span]:translate-x-2 data-[state=checked]:[&_span]:rtl:-translate-x-2"
                    aria-describedby="notifications-description"
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                    disabled={isSubmitting}
                  />
                  <div className="flex grow items-center gap-3">
                    <BellRing aria-hidden="true" />
                    <div className="grid grow gap-2">
                      <Label htmlFor="new-notifications">
                        Notificar{" "}
                        <span className="text-muted-foreground text-xs leading-[inherit] font-normal">
                          (Al completar)
                        </span>
                      </Label>
                      <p
                        id="notifications-description"
                        className="text-muted-foreground text-xs"
                      >
                        Al activar esta opción los usuarios serán notificados
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {notificationsEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="user-select">
                    Destinatarios de la notificación
                  </Label>
                  <Select
                    onValueChange={(value) => {
                      if (!selectedUsers.includes(value)) {
                        setSelectedUsers([...selectedUsers, value]);
                      }
                    }}
                    disabled={isSubmitting || isLoadingUsers}
                  >
                    <SelectTrigger id="user-select">
                      <SelectValue
                        placeholder={
                          isLoadingUsers
                            ? "Cargando usuarios..."
                            : "Seleccionar usuarios"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      {users.map((user) => (
                        <SelectItem
                          key={user.id}
                          value={user.id}
                          disabled={selectedUsers.includes(user.id)}
                        >
                          {user.name}
                        </SelectItem>
                      ))}
                      {users.length === 0 && !isLoadingUsers && (
                        <SelectItem value="" disabled>
                          No hay usuarios disponibles
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>

                  {selectedUsers.length > 0 && (
                    <div
                      className="flex flex-wrap gap-2 mt-2"
                      role="group"
                      aria-label="Usuarios seleccionados"
                    >
                      {selectedUsers.map((userId) => {
                        const user = users.find((u) => u.id === userId);
                        return (
                          <Badge
                            key={userId}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {user?.name || "Usuario desconocido"}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 hover:bg-transparent"
                              onClick={() => removeUser(userId)}
                              disabled={isSubmitting}
                              aria-label={`Eliminar ${user?.name} de la lista`}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {isSubmitting ? "Creando..." : "Crear tarea"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
