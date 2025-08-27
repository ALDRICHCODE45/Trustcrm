"use client";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { VacancyWithRelations } from "@/app/(dashboard)/reclutador/components/ReclutadorColumns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { VacancyEstado, VacancyPrioridad, VacancyTipo } from "@prisma/client";
import { useState, useEffect } from "react";
import { updateVacancy } from "@/actions/vacantes/actions";
import { toast } from "sonner";
import { ToastCustomMessage } from "@/components/ToastCustomMessage";
import { EditVacancyDetailt } from "../VacancyFormComponents/CreateVacancyComponents/EditVacancyComponent";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Contact, Loader2, SquarePen } from "lucide-react";
import {
  Sheet,
  SheetOverlay,
  SheetPortal,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ValidationErrorToast } from "@/components/ui/ValidationErrorToast";
import { useUsers } from "@/hooks/users/use-users";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;

  vacancy: VacancyWithRelations;
}

// Esquema de validación corregido para coincidir con los enums de Prisma
const vacancySchema = z.object({
  tipo: z
    .enum([VacancyTipo.Nueva, VacancyTipo.Garantia, VacancyTipo.Recompra])
    .optional(),
  estado: z
    .enum([
      VacancyEstado.Hunting,
      VacancyEstado.Cancelada,
      VacancyEstado.Entrevistas,
      VacancyEstado.Perdida,
      VacancyEstado.Placement,
      VacancyEstado.QuickMeeting,
      VacancyEstado.PrePlacement,
    ])
    .optional(),
  posicion: z.string().optional(),
  prioridad: z
    .enum([
      VacancyPrioridad.Alta,
      VacancyPrioridad.Normal,
      VacancyPrioridad.Baja,
    ])
    .optional(),
  fechaAsignacion: z.date().optional(),
  fechaEntrega: z.date().optional(),
  salario: z
    .number()
    .min(0, "El salario debe ser mayor o igual a 0")
    .optional(),
  valorFactura: z
    .number()
    .min(0, "El valor de factura debe ser mayor o igual a 0")
    .optional(),
  fee: z.number().min(0, "El fee debe ser mayor o igual a 0").optional(),
  monto: z.number().min(0, "El monto debe ser mayor o igual a 0").optional(),
  //Detalles de la vacante
  prestaciones: z.string().optional(),
  herramientas: z.string().optional(),
  comisiones: z.string().optional(),
  modalidad: z.string().optional(),
  horario: z.string().optional(),
  psicometria: z.string().optional(),
  ubicacion: z.string().optional(),
  comentarios: z.string().optional(),
});

type VacancyFormData = z.infer<typeof vacancySchema>;

export const EditVacancyForm = ({ open, setOpen, vacancy }: Props) => {
  const [loading, setLoading] = useState(false);

  const { loggedUser, fetchLoggedUser } = useUsers();

  const form = useForm<VacancyFormData>({
    resolver: zodResolver(vacancySchema),
    defaultValues: {
      tipo: vacancy.tipo,
      estado: vacancy.estado,
      posicion: vacancy.posicion || "",
      prioridad: vacancy.prioridad,
      fechaAsignacion: vacancy.fechaAsignacion
        ? new Date(vacancy.fechaAsignacion)
        : undefined,
      fechaEntrega: vacancy.fechaEntrega
        ? new Date(vacancy.fechaEntrega)
        : undefined,
      salario: vacancy.salario || undefined,
      valorFactura: vacancy.valorFactura || undefined,
      fee: vacancy.fee || undefined,
      monto: vacancy.monto || undefined,
      prestaciones: vacancy.prestaciones || undefined,
      herramientas: vacancy.herramientas || undefined,
      comisiones: vacancy.comisiones || undefined,
      modalidad: vacancy.modalidad || undefined,
      horario: vacancy.horario || undefined,
      psicometria: vacancy.psicometria || undefined,
      ubicacion: vacancy.ubicacion || undefined,
      comentarios: vacancy.comentarios || undefined,
    },
  });

  useEffect(() => {
    fetchLoggedUser();
  }, []);

  // Resetear el formulario cuando cambie la vacante
  useEffect(() => {
    if (open && vacancy) {
      form.reset({
        tipo: vacancy.tipo,
        estado: vacancy.estado,
        posicion: vacancy.posicion || "",
        prioridad: vacancy.prioridad,
        fechaAsignacion: vacancy.fechaAsignacion
          ? new Date(vacancy.fechaAsignacion)
          : undefined,
        fechaEntrega: vacancy.fechaEntrega
          ? new Date(vacancy.fechaEntrega)
          : undefined,
        salario: vacancy.salario || undefined,
        valorFactura: vacancy.valorFactura || undefined,
        fee: vacancy.fee || undefined,
        monto: vacancy.monto || undefined,
        prestaciones: vacancy.prestaciones || undefined,
        herramientas: vacancy.herramientas || undefined,
        comisiones: vacancy.comisiones || undefined,
        modalidad: vacancy.modalidad || undefined,
        horario: vacancy.horario || undefined,
        psicometria: vacancy.psicometria || undefined,
        ubicacion: vacancy.ubicacion || undefined,
        comentarios: vacancy.comentarios || undefined,
      });
    }
  }, [vacancy, open, form]);

  if (!loggedUser) {
    return (
      <div className="flex justify-center items-center h-full flex-col gap-4">
        <Loader2 className="animate-spin" size={24} />
        <p className="text-sm text-muted-foreground">
          Cargando usuario logeado...
        </p>
      </div>
    );
  }

  const onSubmit = async (data: VacancyFormData) => {
    setLoading(true);
    try {
      // Preparar los datos para la actualización
      const updateData = {
        id: vacancy.id,
        ...data,
      };

      const result = await updateVacancy(updateData);

      //Si es un error de validación, mostrar el toast de validación
      if (!result.ok && result.reason) {
        toast.custom((t) => (
          <ValidationErrorToast
            title="No se puede cambiar el estado"
            message={result.message || "Error al actualizar la vacante"}
            reason={result.reason}
            onClick={() => {
              toast.dismiss(t);
            }}
          />
        ));
        //si no es un error de validacion mostrar el toast de error normal
        if (!result.ok && !result.reason) {
          toast.custom((t) => (
            <ToastCustomMessage
              title="Error"
              message={result.message || "Error al actualizar la vacante"}
              type="error"
              onClick={() => {
                toast.dismiss(t);
              }}
            />
          ));
        }
        return;
      }

      toast.custom((t) => (
        <ToastCustomMessage
          title="Vacante actualizada correctamente"
          message="La vacante se ha actualizado correctamente"
          type="success"
          onClick={() => {
            toast.dismiss(t);
          }}
        />
      ));
    } catch (error) {
      console.error("Error al actualizar la vacante:", error);
      toast.custom((t) => (
        <ToastCustomMessage
          title="Error"
          message="Error al actualizar la vacante"
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

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={(e) => {
              e.preventDefault();
            }}
          >
            <SquarePen />
            Editar
          </DropdownMenuItem>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px] z-50">
          <DialogHeader>
            <DialogTitle>Editar vacante: {vacancy.posicion}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Card>
                <CardHeader>
                  <CardTitle>Detalles de la Vacante</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="tipo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Vacante</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar Tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="z-[100]">
                              <SelectItem value={VacancyTipo.Nueva}>
                                Nueva
                              </SelectItem>
                              <SelectItem value={VacancyTipo.Garantia}>
                                Garantía
                              </SelectItem>
                              <SelectItem value={VacancyTipo.Recompra}>
                                Recompra
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="estado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar Estado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="z-[100]">
                              <SelectItem value={VacancyEstado.QuickMeeting}>
                                Quick Meeting
                              </SelectItem>
                              <SelectItem value={VacancyEstado.Hunting}>
                                Hunting
                              </SelectItem>
                              <SelectItem value={VacancyEstado.Entrevistas}>
                                Entrevistas con Cliente
                              </SelectItem>
                              <SelectItem value={VacancyEstado.Placement}>
                                Placement
                              </SelectItem>
                              <SelectItem value={VacancyEstado.PrePlacement}>
                                Pre Placement
                              </SelectItem>
                              <SelectItem value={VacancyEstado.Perdida}>
                                Posición Perdida
                              </SelectItem>
                              <SelectItem value={VacancyEstado.Cancelada}>
                                Posición Cancelada
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="posicion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Puesto</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ej. Desarrollador Senior"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="prioridad"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prioridad</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar Prioridad" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="z-[100]">
                              <SelectItem value={VacancyPrioridad.Alta}>
                                Alta
                              </SelectItem>
                              <SelectItem value={VacancyPrioridad.Normal}>
                                Normal
                              </SelectItem>
                              <SelectItem value={VacancyPrioridad.Baja}>
                                Baja
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fechaAsignacion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de Asignación</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button variant="outline" className="w-full">
                                  {field.value ? (
                                    format(field.value, "eee dd/MM/yyyy", {
                                      locale: es,
                                    })
                                  ) : (
                                    <span>Seleccionar fecha</span>
                                  )}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              side="top"
                              className="z-[100] w-full"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                locale={es}
                                captionLayout="dropdown"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fechaEntrega"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha Entrega</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button variant="outline" className="w-full">
                                  {field.value ? (
                                    format(field.value, "eee dd/MM/yyyy", {
                                      locale: es,
                                    })
                                  ) : (
                                    <span>Seleccionar fecha</span>
                                  )}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              side="top"
                              className="z-[100] w-full"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                locale={es}
                                captionLayout="dropdown"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {/* Campos solo lectura para reclutador y cliente */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FormLabel>Reclutador</FormLabel>
                      <Input
                        value={vacancy.reclutador?.name || "Sin asignar"}
                        disabled
                      />
                      {/* Función vacía para editar reclutador */}
                    </div>
                    <div>
                      <FormLabel>Cliente</FormLabel>
                      <Input
                        value={vacancy.cliente?.cuenta || "Sin asignar"}
                        disabled
                      />
                      {/* Función vacía para editar cliente */}
                    </div>
                  </div>
                </CardContent>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Contact />
                      Detalles de la vacante
                    </Button>
                  </SheetTrigger>
                  <SheetPortal>
                    <SheetOverlay className="z-[9]" />
                    <EditVacancyDetailt
                      form={form}
                      vacante={vacancy}
                      user_logged={loggedUser}
                    />
                  </SheetPortal>
                </Sheet>
              </Card>

              {/* Botón de guardar */}
              <Button
                type="submit"
                variant="default"
                className="w-full mt-4"
                disabled={loading}
              >
                {loading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};
