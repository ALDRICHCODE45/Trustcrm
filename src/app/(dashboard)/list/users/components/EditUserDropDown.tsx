"use client";
import { Oficina, Role, UserState } from "@prisma/client";
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
import { CircleAlertIcon, Loader2, Pencil, Trash } from "lucide-react";
import { User } from "@prisma/client";
import { deleteUserProfileImage, editUser } from "@/actions/users/create-user";
import { useActionState, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { editUserSchema } from "@/zod/editUserSchema";
import { toast } from "sonner";
import UploadProfileImage from "@/components/UploadProfileImage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function EditUserProfile({
  user,
  activeUserId,
}: {
  user: User;
  activeUserId: string;
}) {
  const { id } = useParams();
  const [canEditEmail, setCanEditEmail] = useState<boolean>(true);
  const [_index, setIndex] = useState<number>();
  const [dialogConfirmOpen, setDialogConfirmOpen] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    user.ingreso ? new Date(user.ingreso) : undefined
  );
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    if (user.id === activeUserId) {
      setCanEditEmail(false);
    }
    console.log({ user, id });
  }, [activeUserId, id, user]);

  const [open, setOpen] = useState<boolean>(false);

  const wrapEditUser = (userId: string) => {
    return async (_prevState: any, formData: FormData) => {
      return await editUser(userId, formData);
    };
  };

  const [lastResult, formAction, isPending] = useActionState(
    wrapEditUser(String(id)),
    undefined
  );

  const [form, fields] = useForm({
    lastResult,
    onSubmit(event, context) {
      if (context.submission?.status === "success") {
        toast.success("Usuario editado exitosamente");
        setOpen(false);
      }
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: editUserSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const deleteImageProfile = async (userId: string) => {
    try {
      const userHasAlreadyImage = user.image;
      if (!userHasAlreadyImage) {
        toast.error("El usuario no tiene una imagen de perfil");
        return;
      }
      const result = deleteUserProfileImage(user.id);

      toast.promise(result, {
        loading: "Cargando...",
        success: () => {
          return "La imagen ha sido removida";
        },
        error: "Error",
      });
    } catch (err) {
      toast.error("No se pudo eliminar la imagen");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Pencil />
        </Button>
      </DialogTrigger>

      <DialogContent className="flex flex-col gap-0 overflow-y-scroll p-0 sm:max-w-4xl [&>button:last-child]:top-3.5 max-h-[min(700px,85vh)]">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b border-border px-6 py-4 text-base">
            Editar Perfil
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">
          Edita los datos de tu perfil.
        </DialogDescription>

        <div className="overflow-y-auto">
          {/* Header con Background e Imagen de Perfil */}
          <div className="relative">
            {/* Background Image */}
            <div
              className="h-48 w-full overflow-hidden"
              style={{
                backgroundImage: `url('/background.png')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Overlay con efecto */}
              <div className="absolute inset-0 bg-gradient-to-r from-gray-500/20 via-gray-600/20 to-gray-700/20"></div>

              {/* Formas decorativas */}
              <div className="absolute top-4 left-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute bottom-8 left-20 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
              <div className="absolute top-8 right-16 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
            </div>

            {/* Avatar posicionado en el lado derecho */}
            <div className="absolute -bottom-16 left-8 flex flex-col items-center">
              <div className="relative group">
                <Avatar
                  className="w-32 h-32 border-4 border-white shadow-2xl cursor-pointer ring-4 ring-white/20 hover:ring-white/40 transition-all duration-300"
                  onClick={() => setIndex(0)}
                >
                  <AvatarImage
                    src={user?.image ? user.image : undefined}
                    alt={user?.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl font-bold">
                    {user?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                {/* Icono de Trash que aparece en hover */}
                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Trash
                    onClick={() => setDialogConfirmOpen(true)}
                    className="w-7 h-7 text-white cursor-pointer"
                    size={5}
                  />
                </div>
              </div>
              <AlertDialog
                open={dialogConfirmOpen}
                onOpenChange={setDialogConfirmOpen}
              >
                <AlertDialogContent className="z-[99999]">
                  <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
                    <div
                      className="flex size-9 shrink-0 items-center justify-center rounded-full border"
                      aria-hidden="true"
                    >
                      <CircleAlertIcon className="opacity-80" size={16} />
                    </div>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        ¿Estás seguro de que deseas eliminar tu perfil?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteImageProfile(user.id)}
                    >
                      Confirmar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <div className="mt-2 text-center">
                <p className="text-sm font-medium text-gray-700">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <div className="px-6 pt-20 pb-6 mt-4">
            <form
              id={form.id}
              action={formAction}
              onSubmit={form.onSubmit}
              noValidate
              className="space-y-6"
            >
              {/* Información Personal */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                  <h3 className="text-lg font-semibold ">
                    Información Personal
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Campo Nombre */}
                  <div className="space-y-2">
                    <Label
                      htmlFor={fields.name.id}
                      className="text-sm font-medium "
                    >
                      Nombre completo
                    </Label>
                    <Input
                      id={fields.name.id}
                      name={fields.name.name}
                      key={fields.name.key}
                      defaultValue={user.name}
                      placeholder="Ingresa tu nombre completo"
                      type="text"
                    />
                    <p className="text-sm text-red-500">{fields.name.errors}</p>
                  </div>

                  {/* Campo Email */}
                  <div className="space-y-2">
                    <Label
                      htmlFor={fields.email.id}
                      className="text-sm font-medium"
                    >
                      Correo electrónico
                    </Label>
                    <Input
                      id={fields.email.id}
                      name={fields.email.name}
                      key={fields.email.key}
                      defaultValue={user.email}
                      placeholder="correo@ejemplo.com"
                      type="email"
                      disabled={!canEditEmail}
                    />
                    <p className="text-sm text-red-500">
                      {fields.email.errors}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Campo Teléfono */}
                  <div className="space-y-2">
                    <Label
                      htmlFor={fields.celular?.id}
                      className="text-sm font-medium "
                    >
                      Número de teléfono
                    </Label>
                    <Input
                      id={fields.celular?.id}
                      name={fields.celular?.name}
                      key={fields.celular?.key}
                      defaultValue={user.celular}
                      placeholder="+52 55 1234 5678"
                      type="tel"
                    />
                    <p className="text-sm text-red-500">
                      {fields.celular?.errors}
                    </p>
                  </div>

                  {/* Campo Edad */}
                  <div className="space-y-2">
                    <Label
                      htmlFor={fields.age?.id}
                      className="text-sm font-medium"
                    >
                      Edad
                    </Label>
                    <Input
                      id={fields.age?.id}
                      name={fields.age?.name}
                      key={fields.age?.key}
                      defaultValue={user.age}
                      placeholder="25"
                      type="number"
                      min="18"
                      max="100"
                    />
                    <p className="text-sm text-red-500">{fields.age?.errors}</p>
                  </div>
                </div>

                {/* Campo Dirección */}
                <div className="flex w-full gap-4">
                  {/* Campo Dirección */}
                  <div className="space-y-2 w-1/2">
                    <Label
                      htmlFor={fields.direccion.id}
                      className="text-sm font-medium "
                    >
                      Dirección
                    </Label>
                    <Input
                      id={fields.direccion.id}
                      name={fields.direccion.name}
                      key={fields.direccion.key}
                      defaultValue={user.direccion}
                      placeholder="Calle, número, colonia, ciudad"
                      type="text"
                    />
                    <p className="text-sm text-red-500">
                      {fields.direccion.errors}
                    </p>
                  </div>
                  {/* Campo Fecha de ingreso */}
                  <div className="space-y-2 w-1/2">
                    {selectedDate && (
                      <input
                        type="hidden"
                        name={fields.ingreso.name}
                        key={fields.ingreso.key}
                        value={selectedDate.toISOString()}
                      />
                    )}
                    <Label
                      htmlFor={fields.ingreso.id}
                      className="text-sm font-medium "
                    >
                      Fecha de ingreso
                    </Label>
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                        >
                          {selectedDate ? (
                            format(selectedDate, "eee dd/MM/yyyy", {
                              locale: es,
                            })
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent side="top" className="z-[999999] w-full">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                    <p className="text-sm text-red-500">
                      {fields.ingreso.errors}
                    </p>
                  </div>
                </div>
              </div>

              {/* Configuración Laboral */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></div>
                  <h3 className="text-lg font-semibold ">
                    Configuración Laboral
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Campo Role */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium ">Rol</Label>
                    <Select
                      name={fields.role.name}
                      key={fields.role.key}
                      defaultValue={user.role}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                      <SelectContent className="z-[9999]">
                        <SelectItem
                          value={Role.Admin}
                          className="cursor-pointer"
                        >
                          Administrador
                        </SelectItem>
                        <SelectItem value={Role.GL} className="cursor-pointer">
                          Generador de Leads
                        </SelectItem>
                        <SelectItem
                          value={Role.reclutador}
                          className="cursor-pointer"
                        >
                          Reclutador
                        </SelectItem>
                        <SelectItem value={Role.MK} className="cursor-pointer">
                          Marketing
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-red-500">{fields.role.errors}</p>
                  </div>

                  {/* Campo Oficina */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium ">Oficina</Label>
                    <Select
                      name={fields.oficina.name}
                      key={fields.oficina.key}
                      defaultValue={user.Oficina}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona oficina" />
                      </SelectTrigger>
                      <SelectContent className="z-[9999]">
                        <SelectItem
                          value={Oficina.Oficina1}
                          className="cursor-pointer"
                        >
                          Oficina 1
                        </SelectItem>
                        <SelectItem
                          value={Oficina.Oficina2}
                          className="cursor-pointer"
                        >
                          Oficina 2
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-red-500">
                      {fields.oficina.errors}
                    </p>
                  </div>

                  {/* Campo Status */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium ">Estado</Label>
                    <Select
                      defaultValue={user.State}
                      name={fields.status.name}
                      key={fields.status.key}
                    >
                      <SelectTrigger className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Selecciona estado" />
                      </SelectTrigger>
                      <SelectContent className="z-[9999]">
                        <SelectItem
                          value={UserState.ACTIVO}
                          className="cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Activo
                          </span>
                        </SelectItem>
                        <SelectItem
                          value={UserState.INACTIVO}
                          className="cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            Inactivo
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-red-500">
                      {fields.status.errors}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sección de Imagen */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6"></div>
                  <h3 className="text-lg font-semibold ">Imagen de Perfil</h3>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <UploadProfileImage userId={user.id} />
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Footer con botones */}
        <DialogFooter className="border-t px-6 py-4">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="h-10">
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit" form={form.id}>
            {isPending ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <span>Guardar cambios</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
