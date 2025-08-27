"use client";
import { Loader2, UserPlus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActionState } from "react";
import { createUser } from "@/actions/users/create-user";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { createUserSchema } from "@/zod/createUserSchema";
import { UserState, Role, Oficina } from "@prisma/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ToastCustomMessage } from "@/components/ToastCustomMessage";

export default function CreateProfile() {
  const [open, setOpen] = useState(false);
  const [lastResult, formAction, isPending] = useActionState(
    createUser,
    undefined
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: createUserSchema,
      });
    },
    onSubmit: () => {
      setOpen(false);
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  useEffect(() => {
    if (!lastResult) return;

    if (lastResult.status === "error" && lastResult.error) {
      toast.custom((t) => (
        <ToastCustomMessage
          title="Error"
          message="Ocurrio un error"
          type="error"
          onClick={() => {
            toast.dismiss(t);
          }}
        />
      ));
    }

    if (lastResult.status === "success" && !lastResult.error) {
      toast.custom((t) => (
        <ToastCustomMessage
          title="Operacion Exitosa"
          message="Usuario creado correctamente"
          type="success"
          onClick={() => {
            toast.dismiss(t);
          }}
        />
      ));
    }
  }, [lastResult]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <UserPlus />
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-0 overflow-y-scroll p-0 sm:max-w-lg [&>button:last-child]:top-3.5 max-h-[min(640px,80vh)] ">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b px-6 py-4 text-base">
            Edit profile
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">
          Make changes to your profile here. You can change your photo and set a
          username.
        </DialogDescription>
        <div className="overflow-y-auto">
          <div className="px-6 pt-4 pb-6">
            <form
              className="space-y-4"
              id={form.id}
              action={formAction}
              onSubmit={form.onSubmit}
              noValidate
            >
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1 space-y-2">
                  <Label>Nombre</Label>
                  <Input
                    id={fields.name.id}
                    name={fields.name.name}
                    key={fields.name.key}
                    defaultValue={fields.name.initialValue}
                    placeholder="User"
                    type="text"
                    required
                  />
                  <p className="text-sm text-red-500">{fields.name.errors}</p>
                </div>
                <div className="flex-1 space-y-2">
                  <Label>Email</Label>
                  <Input
                    id={fields.email.id}
                    name={fields.email.name}
                    key={fields.email.key}
                    defaultValue={fields.email.initialValue}
                    placeholder="@trust.company"
                    type="text"
                    required
                  />
                  <p className="text-sm text-red-500">{fields.email.errors}</p>
                </div>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1  space-y-2">
                  <Label>Contraseña</Label>
                  <Input
                    id={fields.password.id}
                    name={fields.password.name}
                    key={fields.password.key}
                    defaultValue={fields.password.initialValue}
                    className="peer pe-9"
                    placeholder="********"
                    type="text"
                    required
                  />
                  <p className="text-sm text-red-500">
                    {fields.password.errors}
                  </p>
                </div>

                <div className="flex-1  space-y-2">
                  <Label>Edad</Label>
                  <Input
                    id={fields.age.id}
                    name={fields.age.name}
                    key={fields.age.key}
                    defaultValue={fields.age.initialValue}
                    className="peer pe-9"
                    placeholder="18"
                    type="text"
                    required
                  />
                  <p className="text-sm text-red-500">
                    {fields.password.errors}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="w-1/2">
                  <Label>Oficina</Label>
                  <Select
                    name={fields.oficina.name}
                    key={fields.oficina.key}
                    defaultValue={fields.oficina.initialValue}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      <SelectItem
                        value={Oficina.Oficina1}
                        className="cursor-pointer"
                      >
                        1
                      </SelectItem>
                      <SelectItem
                        value={Oficina.Oficina2}
                        className="cursor-pointer"
                      >
                        2
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <p className="text-sm text-red-500">
                    {fields.oficina.errors}
                  </p>
                </div>
                <div className="w-1/2">
                  <Label>Status</Label>
                  <Select
                    name={fields.status.name}
                    key={fields.status.key}
                    defaultValue={fields.status.initialValue}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      <SelectItem
                        value={UserState.ACTIVO}
                        className="cursor-pointer"
                      >
                        ACTIVO
                      </SelectItem>
                      <SelectItem
                        value={UserState.INACTIVO}
                        className="cursor-pointer"
                      >
                        INACTIVO
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-red-500">{fields.status.errors}</p>
                </div>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="w-1/2 space-y-2">
                  <Label>Role</Label>
                  <Select
                    name={fields.role.name}
                    key={fields.role.key}
                    defaultValue={fields.role.initialValue}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      <SelectItem value={Role.MK} className="cursor-pointer">
                        Marketing
                      </SelectItem>
                      <SelectItem
                        value={Role.reclutador}
                        className="cursor-pointer"
                      >
                        Reclutador
                      </SelectItem>
                      <SelectItem value={Role.GL} className="cursor-pointer">
                        GL
                      </SelectItem>
                      <SelectItem value={Role.Admin} className="cursor-pointer">
                        Admin
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <p className="text-sm text-red-500">{fields.status.errors}</p>
                </div>
                <div className="space-y-2 w-1/2">
                  <Label>Celular</Label>
                  <Input
                    id={fields.celular.id}
                    name={fields.celular.name}
                    key={fields.celular.key}
                    defaultValue={fields.celular.initialValue}
                    placeholder="+523378151"
                    type="text"
                    required
                  />
                  <p className="text-sm text-red-500">
                    {fields.celular.errors}
                  </p>
                </div>
              </div>

              <div className="space-y-2 w-full">
                {selectedDate && (
                  <input
                    type="hidden"
                    name={fields.ingreso.name}
                    key={fields.ingreso.key}
                    value={selectedDate.toISOString()}
                  />
                )}

                <Label>Fecha de ingreso</Label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" className="w-full">
                      {selectedDate ? (
                        format(selectedDate, "eee dd/MM/yyyy", {
                          locale: es,
                        })
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full">
                    <Calendar
                      captionLayout="dropdown"
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="*:not-first:mt-2">
                <Label>Dirección</Label>
                <Textarea
                  name={fields.direccion.name}
                  key={fields.direccion.key}
                  defaultValue={fields.direccion.initialValue}
                  id={fields.direccion.id}
                  placeholder="Av Insurgentes"
                />

                <p className="text-sm text-red-500">{fields.status.errors}</p>
              </div>

              <Button
                className="w-full"
                type="submit"
                variant={"default"}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Cargando...
                  </>
                ) : (
                  <span>Crear usuario</span>
                )}
              </Button>
            </form>
          </div>
        </div>
        <DialogFooter className="border-t px-6 py-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
