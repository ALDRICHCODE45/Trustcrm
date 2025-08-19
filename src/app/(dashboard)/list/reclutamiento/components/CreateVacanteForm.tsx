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
  Plus,
  FileText,
  UserIcon,
  CircleOff,
  ChevronDownIcon,
  CheckIcon,
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
import { SelectNative } from "@/components/ui/select-native";
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
import { Label } from "@/components/ui/label";
import { useVacancyDetails } from "@/hooks/vacancy/use-vacancies";
import { useRouter } from "next/navigation";

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
  reclutadorId: z.string().optional(),

  // Información financiera
  salario: z.number().optional(),
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
});

type VacancyFormData = z.infer<typeof vacancySchema>;

// Datos de ejemplo para archivos (manteniendo los originales)
interface File {
  id: number;
  name: string;
  type: string;
  size: string;
  lastUpdated: string;
  icon: React.ReactNode;
}

const demoFiles: File[] = [
  {
    id: 1,
    name: "Checklist",
    type: "PDF",
    size: "2.4 MB",
    lastUpdated: "26 Feb, 2025",
    icon: <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
  },
  {
    id: 2,
    name: "Muestra Perfil",
    type: "DOCX",
    size: "1.2 MB",
    lastUpdated: "20 Feb, 2025",
    icon: <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />,
  },
];

interface Props {
  reclutadores: User[];

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
}: Props) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus />
          Crear Vacante
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] z-[200]">
        <VacancyForm
          reclutadores={reclutadores}
          clientes={clientes}
          user_logged={user_logged}
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
}: Props) {
  const router = useRouter();
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
      clienteId: "",
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

      const result = await createVacancy(vacancyData);

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
      router.refresh();
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
          <TabsList className="grid w-full grid-cols-3 mb-4 mt-4">
            <TabsTrigger value="basic">Información Básica</TabsTrigger>
            <TabsTrigger value="financial">Información Fiscal</TabsTrigger>
            <TabsTrigger value="checklist">Requisitos</TabsTrigger>
          </TabsList>

          {/* Tab de Información Básica */}
          <TabsContent value="basic">
            <BasicInformationTab
              form={form}
              reclutadores={reclutadores}
              clientes={clientes}
              user_logged={user_logged}
            />
          </TabsContent>

          {/* Tab de Información Fiscal */}
          <TabsContent value="financial">
            <FinancialInformationTab form={form} user_logged={user_logged} />
          </TabsContent>
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
}: {
  form: any; // FormReturn from react-hook-form
  reclutadores: User[];
  clientes: Client[];
  user_logged: {
    id: string;
    name: string;
    role: string;
  };
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar Status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="z-[8888]">
                    <SelectItem value={VacancyEstado.QuickMeeting}>
                      Quick Meeting
                    </SelectItem>
                    <SelectItem value={VacancyEstado.Hunting}>
                      Hunting
                    </SelectItem>
                    <SelectItem value={VacancyEstado.Cancelada}>
                      Cancelada
                    </SelectItem>
                    <SelectItem value={VacancyEstado.Entrevistas}>
                      Entrevistas
                    </SelectItem>
                    <SelectItem value={VacancyEstado.Perdida}>
                      Perdida
                    </SelectItem>
                    <SelectItem value={VacancyEstado.PrePlacement}>
                      Pre Placement
                    </SelectItem>
                    <SelectItem value={VacancyEstado.Placement}>
                      Placement
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
                <FormLabel>Posición</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Desarrollador Senior" {...field} />
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
                  <SelectContent className="z-[8888]">
                    <SelectItem value={VacancyPrioridad.Alta}>Alta</SelectItem>
                    <SelectItem value={VacancyPrioridad.Normal}>
                      Normal
                    </SelectItem>
                    <SelectItem value={VacancyPrioridad.Baja}>Baja</SelectItem>
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
          <FormField
            control={form.control}
            name="clienteId"
            render={({ field }) => (
              <FormItem>
                <div className="*:not-first:mt-2">
                  <Label>Cliente</Label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
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
                    </PopoverTrigger>
                    <PopoverContent
                      className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0 z-[9999]"
                      align="start"
                    >
                      <Command>
                        <CommandInput placeholder="Buscar Cliente..." />
                        <CommandList>
                          <CommandEmpty>
                            No se encontraron clientes.
                          </CommandEmpty>
                          <CommandGroup>
                            {clientes.map((cliente) => (
                              <CommandItem
                                key={cliente.id}
                                className="z-[9999]"
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
                </div>

                {/* <DropdownMenu>
                  <DropdownMenuTrigger asChild className="w-full">
                    <Button variant="outline" size="sm" className="flex">
                      <UserIcon className="h-4 w-4 mr-2" />
                      <span className="truncate">
                        {field.value
                          ? clientes.find(
                              (c) => c.id.toString() === field.value
                            )?.cuenta || "Seleccionar"
                          : "Seleccionar"}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full max-h-[250px] overflow-y-auto z-[999]">
                    {clientes.length === 0 && (
                      <div className="w-full h-[200px] flex justify-center items-center gap-2">
                        <div className="flex flex-col items-center gap-2">
                          <CircleOff className="h-6 w-6 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            No hay clientes disponibles
                          </span>
                        </div>
                      </div>
                    )}

                    {clientes.length > 0 &&
                      clientes.map((cliente) => (
                        <DropdownMenuItem
                          key={cliente.id}
                          className="flex items-center gap-3 p-2 cursor-pointer"
                          onClick={() => field.onChange(cliente.id.toString())}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <Avatar className="h-9 w-9 shrink-0">
                              <AvatarFallback>
                                {cliente.cuenta?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {cliente.cuenta}
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
                            <Link href={`/client/${cliente.id}`}>Ver</Link>
                          </Button>
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu> */}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="w-full">
          <VacancyDetails form={form} />
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para la pestaña de información fiscal
const FinancialInformationTab = ({
  form,
  user_logged,
}: {
  form: any; // FormReturn from react-hook-form
  user_logged: {
    id: string;
    name: string;
    role: string;
  };
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">Detalles Financieros</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="salario"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Salario</FormLabel>
              <FormControl>
                <div className="*:not-first:mt-2 ">
                  <div className="flex rounded-md shadow-xs relative">
                    <span className="mr-1 text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-sm peer-disabled:opacity-50">
                      $
                    </span>
                    <Input
                      {...field}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || undefined)
                      }
                      className="-me-px rounded-e-none ml-3 shadow-none focus-visible:z-10"
                      placeholder="1000"
                      type="number"
                    />
                    <SelectNative className="text-muted-foreground hover:text-foreground w-fit rounded-s-none shadow-none">
                      <option>MXN</option>
                      <option>USD</option>
                    </SelectNative>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {user_logged.role === "Admin" && (
          <>
            <FormField
              control={form.control}
              name="valorFactura"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Factura</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || undefined)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fee</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || undefined)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
      </div>
      <div className="text-xs text-muted-foreground">
        * Todos los montos son en la moneda local
      </div>
    </CardContent>
  </Card>
);

export default CreateVacanteForm;
