"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  UserIcon,
  CircleOff,
  ChevronDownIcon,
  CheckIcon,
  BriefcaseBusiness,
  Contact,
  BellRing,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { addDays, format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Client,
  User,
  VacancyEstado,
  VacancyPrioridad,
  VacancyTipo,
} from "@prisma/client";
import { toast } from "sonner";
import { createVacancy } from "@/actions/vacantes/actions";
import { ChecklistForm } from "../VacancyFormComponents/CreateVacancyComponents/ChecklistForm";
import { ToastCustomMessage } from "@/components/ToastCustomMessage";
import { VacancyDetails } from "../VacancyFormComponents/CreateVacancyComponents/VacancyDetails";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { createVacancyAssignedNotification } from "@/actions/notifications/special-notifications";
import {
  Sheet,
  SheetOverlay,
  SheetPortal,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";

// Schema basado en el modelo Vacancy de Prisma
const vacancySchema = z.object({
  // Información básica
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
  posicion: z.string().min(1, "La posición es requerida"),
  prioridad: z
    .enum([
      VacancyPrioridad.Alta,
      VacancyPrioridad.Normal,
      VacancyPrioridad.Baja,
    ])
    .optional(),
  fechaAsignacion: z.date().optional(),
  fechaEntrega: z.date().optional(),
  reclutadorId: z.string().optional(),

  // Información financiera
  salario: z.string().optional(),
  valorFactura: z.number().optional(),
  fee: z.number().optional(),
  monto: z.number().optional(),

  // Cliente (requerido según el esquema de Prisma)
  clienteId: z.string().min(1, "El cliente es requerido"),

  //Detalles de la vacante
  prestaciones: z.string().optional(),
  herramientas: z.string().optional(),
  comisiones: z.string().optional(),
  modalidad: z.string().optional(),
  horario: z.string().optional(),
  psicometria: z.string().optional(),
  ubicacion: z.string().optional(),
  comentarios: z.string().optional(),

  // Requisitos del checklist
  requisitos: z.array(z.object({ valor: z.string() })).optional(),

  // Nueva opción para enviar notificación especial
  enviarNotificacion: z.boolean().optional(),
});

type VacancyFormData = z.infer<typeof vacancySchema>;

interface Props {
  reclutadores: User[];
  clientDefaultId?: string;

  clientes: Client[];
  user_logged: {
    id: string;
    name: string;
    role: string;
  };
  onVacancyCreated?: () => void;
}

// Componente principal para crear una vacante
export const CreateVacanteForm = ({
  reclutadores,
  clientes,
  user_logged,
  onVacancyCreated,
  clientDefaultId,
}: Props) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <BriefcaseBusiness />
          Crear Vacante
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] z-[200]">
        <VacancyForm
          reclutadores={reclutadores}
          clientes={clientes}
          user_logged={user_logged}
          onVacancyCreated={onVacancyCreated}
          clientDefaultId={clientDefaultId}
        />
      </DialogContent>
    </Dialog>
  );
};

// Componente principal del formulario con react-hook-form
function VacancyForm({
  reclutadores,
  clientes,
  user_logged,
  onVacancyCreated,
  clientDefaultId = "",
}: Props) {
  const form = useForm<VacancyFormData>({
    resolver: zodResolver(vacancySchema),
    defaultValues: {
      tipo: VacancyTipo.Recompra,
      estado: VacancyEstado.QuickMeeting,
      posicion: "",
      prioridad: VacancyPrioridad.Normal,
      fechaAsignacion: new Date(),
      fechaEntrega: undefined,
      reclutadorId: user_logged.role === "Admin" ? "" : user_logged.id,
      clienteId: clientDefaultId,
      salario: undefined,
      valorFactura: undefined,
      fee: undefined,
      monto: undefined,
      prestaciones: "",
      herramientas: "",
      comisiones: "",
      modalidad: "",
      horario: "",
      psicometria: "",
      ubicacion: "",
      comentarios: "",
      requisitos: [{ valor: "" }], // Al menos un requisito inicial
      enviarNotificacion: true, // Por defecto enviar notificación
    },
  });

  const onSubmit = async (data: VacancyFormData) => {
    try {
      // Procesar los requisitos antes de enviar
      const requisitosLimpios =
        data.requisitos
          ?.map((req) => req.valor.trim())
          .filter((req) => req.length > 0) || [];

      const vacancyData = {
        ...data,
        requisitos: requisitosLimpios,
      };

      //crear la vacante
      const result = await createVacancy(vacancyData);
      //validar si el estado inicial es "Quick Meeting"
      if (vacancyData.estado === VacancyEstado.QuickMeeting) {
        //Crear tareas para completar el estado satisfactoriamente
      }

      if (!result.ok) {
        toast.custom((t) => (
          <ToastCustomMessage
            title="Error al crear la vacante"
            message="Por favor, intenta nuevamente"
            type="error"
            onClick={() => {
              toast.dismiss(t);
            }}
          />
        ));
        return;
      }

      // Crear notificación especial si se solicita
      if (data.enviarNotificacion && result.vacancy && data.reclutadorId) {
        await createVacancyAssignedNotification(
          result.vacancy.id,
          data.reclutadorId,
          user_logged.id,
          true
        );
      }

      toast.custom((t) => (
        <ToastCustomMessage
          title="Vacante creada exitosamente"
          message="La vacante ha sido creada exitosamente"
          type="success"
          onClick={() => {
            toast.dismiss(t);
          }}
        />
      ));
      form.reset();
      onVacancyCreated?.();
    } catch (error) {
      toast.custom((t) => (
        <ToastCustomMessage
          title="Error al crear la vacante"
          message="Por favor, intenta nuevamente"
          type="error"
          onClick={() => {
            toast.dismiss(t);
          }}
        />
      ));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 mt-4">
            <TabsTrigger value="basic">Información Básica</TabsTrigger>
            <TabsTrigger value="checklist">Requisitos (Checklist)</TabsTrigger>
          </TabsList>

          {/* Tab de Información Básica */}
          <TabsContent value="basic">
            <BasicInformationTab
              form={form}
              reclutadores={reclutadores}
              clientes={clientes}
              user_logged={user_logged}
              clientDefaultId={clientDefaultId}
            />
          </TabsContent>

          {/* Tab de Requisitos */}
          <TabsContent value="checklist">
            <ChecklistForm form={form} />
          </TabsContent>

          {/* Botón de Guardar */}
          <div className="flex justify-between gap-3">
            <Button type="submit" variant="default" className="w-full mt-4">
              Guardar Vacante
            </Button>
            <Button type="button" variant="outline" className="w-full mt-4">
              Cerrar
            </Button>
          </div>
        </Tabs>
      </form>
    </Form>
  );
}

// Componente para la pestaña de información básica
const BasicInformationTab = ({
  form,
  reclutadores,
  clientes,
  user_logged,
  clientDefaultId,
}: {
  form: any; // FormReturn from react-hook-form
  reclutadores: User[];
  clientes: Client[];
  user_logged: {
    id: string;
    name: string;
    role: string;
  };
  clientDefaultId: string;
}) => {
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Usar los valores del formulario directamente
  const fechaAsignacion = form.watch("fechaAsignacion");
  const prioridad = form.watch("prioridad");

  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    //Todo: cambiar la fecha de entrega en base a la prioridad
    if (fechaAsignacion && prioridad) {
      let fechaEntrega: Date;
      if (prioridad === VacancyPrioridad.Alta) {
        fechaEntrega = addDays(fechaAsignacion, 5);
      } else if (prioridad === VacancyPrioridad.Normal) {
        fechaEntrega = addDays(fechaAsignacion, 9);
      } else {
        fechaEntrega = addDays(fechaAsignacion, 15);
      }
      form.setValue("fechaEntrega", fechaEntrega);
    }
  }, [fechaAsignacion, prioridad, form]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          Detalles de la Vacante
        </CardTitle>
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
                  <SelectContent className="z-[888]">
                    <SelectItem value={VacancyTipo.Nueva}>Nueva</SelectItem>
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
                <FormLabel>Status</FormLabel>
                <Button type="button" variant="outline" className="w-full">
                  {field.value}
                </Button>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="posicion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Posición</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Desarrollador Senior" {...field} />
                </FormControl>
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
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant="outline" className="w-full">
                        {fechaAsignacion ? (
                          format(fechaAsignacion, "eee dd/MM/yyyy", {
                            locale: es,
                          })
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent side="top" className="z-[999999] w-full">
                    <Calendar
                      mode="single"
                      selected={fechaAsignacion}
                      onSelect={field.onChange}
                      locale={es}
                      captionLayout="dropdown"
                      required
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
                  <PopoverContent side="top" className="z-[999999] w-full">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      locale={es}
                      captionLayout="dropdown"
                      required
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="reclutadorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reclutador</FormLabel>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex"
                      disabled={user_logged.role !== "Admin"}
                    >
                      <UserIcon className="h-4 w-4 mr-2" />
                      <span className="truncate">
                        {field.value
                          ? reclutadores.find(
                              (r) => r.id.toString() === field.value
                            )?.name || "Seleccionar"
                          : "Seleccionar"}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full max-h-[250px] overflow-y-auto z-[999]">
                    {reclutadores.length === 0 && (
                      <div className="w-full h-[200px] flex justify-center items-center gap-2">
                        <div className="flex flex-col items-center gap-2">
                          <CircleOff className="h-6 w-6 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            No hay reclutadores disponibles
                          </span>
                        </div>
                      </div>
                    )}

                    {reclutadores.length > 0 &&
                      user_logged.role === "Admin" &&
                      reclutadores.map((recruiter) => (
                        <DropdownMenuItem
                          key={recruiter.id}
                          className="flex items-center gap-3 p-2 cursor-pointer"
                          onClick={() =>
                            field.onChange(recruiter.id.toString())
                          }
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <Avatar className="h-9 w-9 shrink-0">
                              <AvatarImage
                                src={recruiter.image || ""}
                                alt={recruiter.name}
                                className="object-cover"
                              />
                              <AvatarFallback>
                                {recruiter.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {recruiter.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {recruiter.email}
                              </span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="link"
                            className="ml-auto h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            asChild
                          >
                            <Link href={`/profile/${recruiter.id}`}>Ver</Link>
                          </Button>
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <FormMessage />
              </FormItem>
            )}
          />

          {clientDefaultId ? (
            <div className="flex flex-col gap-3">
              <Label>Cliente</Label>
              <Button
                disabled
                variant="outline"
                className="border border-black"
              >
                {
                  clientes.find((cliente) => cliente.id === clientDefaultId)
                    ?.cuenta
                }
              </Button>
            </div>
          ) : (
            <FormField
              control={form.control}
              name="clienteId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]"
                        >
                          <span
                            className={cn(
                              "truncate",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? clientes.find(
                                  (cliente) => cliente.id === field.value
                                )?.cuenta
                              : "Seleccionar Cliente"}
                          </span>
                          <ChevronDownIcon
                            size={16}
                            className="text-muted-foreground/80 shrink-0"
                            aria-hidden="true"
                          />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0 z-[999999]"
                      align="start"
                    >
                      <Command className="z-[999999]">
                        <CommandInput placeholder="Buscar Cliente..." />
                        <CommandList className="">
                          <CommandEmpty>
                            No se encontraron clientes.
                          </CommandEmpty>
                          <CommandGroup className="overflow-y-auto">
                            {clientes.map((cliente) => (
                              <CommandItem
                                key={cliente.id}
                                value={cliente.cuenta || ""}
                                onSelect={() => {
                                  const newValue =
                                    field.value === cliente.id
                                      ? ""
                                      : cliente.id;
                                  field.onChange(newValue);
                                  setValue(newValue || "");
                                  setOpen(false);
                                }}
                              >
                                {cliente.cuenta}
                                {field.value === cliente.id && (
                                  <CheckIcon size={16} className="ml-auto" />
                                )}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="w-full">
          <Sheet>
            <SheetTrigger asChild className="mt-4 w-full">
              <Button variant="outline">
                <Contact />
                <span>Detalles de la vacante</span>
              </Button>
            </SheetTrigger>

            <SheetPortal>
              <SheetOverlay className="z-[999]" />
              <VacancyDetails form={form} user_logged={user_logged} />
            </SheetPortal>
          </Sheet>
        </div>

        {/* Opción para enviar notificación especial */}
        {user_logged.role === "Admin" && (
          <div className="pt-4 border-t">
            <FormField
              control={form.control}
              name="enviarNotificacion"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <div className="border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
                    <BellRing size={20} />
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="order-1 after:absolute after:inset-0"
                      />
                    </FormControl>
                    <div className="flex grow items-start gap-3">
                      <div className="grid gap-2">
                        <FormLabel>
                          Enviar notificación especial al reclutador
                        </FormLabel>
                        <p className="text-muted-foreground text-xs">
                          Se mostrará un dialog prominente al reclutador
                          asignado informando sobre la nueva vacante
                        </p>
                      </div>
                    </div>
                  </div>
                </FormItem>
              )}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CreateVacanteForm;
