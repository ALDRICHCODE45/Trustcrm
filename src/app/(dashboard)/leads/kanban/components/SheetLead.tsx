import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  CalendarIcon,
  LinkIcon,
  Loader2,
  Plus,
  SquarePen,
  TrashIcon,
  UserX,
} from "lucide-react";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeadWithRelations } from "../page";
import { LeadStatus, Role } from "@prisma/client";
import {
  ContactoCard,
  ContactWithRelations,
} from "../../components/ContactCard";
import { Badge } from "@/components/ui/badge";
import { leadStatusMap } from "@/app/(dashboard)/list/leads/components/LeadChangeStatus";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getDiffDays } from "@/app/helpers/getDiffDays";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@radix-ui/react-dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useForm, Controller } from "react-hook-form";
import {
  EditLeadHistoryFormData,
  EditLeadHistorySchema,
} from "@/zod/LeadHistory";
import { cn } from "@/core/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ToastCustomMessage } from "@/components/ToastCustomMessage";
import {
  deleteLeadHistoryById,
  editLeadHistoryById,
} from "@/actions/leads/history/actions";
import { useUsers } from "@/hooks/users/use-users";
import { AddHistoryDialog } from "./historyComponents/AddHistoryDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface Props {
  lead: LeadWithRelations;
  updateLeadInState?: (
    leadId: string,
    updates: Partial<LeadWithRelations>
  ) => void;
}

export const getStatusColor = (status: LeadStatus) => {
  const statusColors = {
    [LeadStatus.Contacto]: "bg-gray-200 text-black",
    [LeadStatus.ContactoCalido]: "bg-yellow-100 text-yellow-800",
    [LeadStatus.SocialSelling]: "bg-green-100 text-green-800",
    [LeadStatus.CitaValidada]: "bg-purple-100 text-purple-800",
    [LeadStatus.CitaAgendada]: "bg-indigo-100 text-indigo-800",
    [LeadStatus.Asignadas]: "bg-emerald-100 text-emerald-800",
    [LeadStatus.StandBy]: "bg-red-100 text-red-800",
    [LeadStatus.CitaAtendida]: "bg-purple-100 text-purple-800",
  };
  return statusColors[status];
};

// Función helper para mostrar el número de empleados en formato legible
const getEmployeeCountDisplay = (count: number | null): string => {
  if (!count) return "No especificado";

  if (count <= 10) return "1-10 empleados";
  if (count <= 50) return "11-50 empleados";
  if (count <= 100) return "51-100 empleados";
  if (count <= 500) return "101-500 empleados";
  return "Más de 500 empleados";
};

export function LeadSheet({ lead, updateLeadInState }: Props) {
  const diffInDays = getDiffDays(lead.createdAt);
  const [contactos, setContactos] = useState<ContactWithRelations[]>(
    lead?.contactos || []
  );
  const [addHistoryDialog, setAddHistoryDialog] = useState<boolean>(false);

  const [linkVerify, setLinkVerfy] = useState(lead.link);
  const [historyEditing, setHistoryEditing] = useState<string | null>(null);
  const [historyDate, setHistoryDate] = useState<Date | undefined>(undefined);
  const [dialogEditOpen, setDialogEditOpen] = useState(false);

  const { loggedUser, fetchLoggedUser } = useUsers();

  useEffect(() => {
    fetchLoggedUser();
  }, [fetchLoggedUser]);

  useEffect(() => {
    if (!/^https?:\/\//i.test(lead.link)) {
      setLinkVerfy(`https://${lead.link}`);
    }
  }, [lead]);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditLeadHistoryFormData>({
    resolver: zodResolver(EditLeadHistorySchema),
    defaultValues: {
      status: lead.status,
      changedAt: new Date().toDateString(),
    },
  });

  if (!loggedUser) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
      </div>
    );
  }

  const onSubmit = async (data: { changedAt: string; status: string }) => {
    try {
      if (!historyEditing) {
        toast.custom((t) => (
          <ToastCustomMessage
            message="Selecciona un historial para editar"
            type="error"
            onClick={() => toast.dismiss(t)}
            title="Error"
          />
        ));
        return;
      }
      //hacer el llamado a la accion
      const dataToSend = {
        id: historyEditing,
        changedAt: new Date(data.changedAt),
        status: data.status as LeadStatus,
      };

      const response = await editLeadHistoryById(dataToSend);
      if (!response.ok) {
        toast.custom((t) => (
          <ToastCustomMessage
            message={response.message || "Error al actualizar el historial"}
            type="error"
            onClick={() => toast.dismiss(t)}
            title="Error"
          />
        ));
        return;
      }

      toast.custom((t) => (
        <ToastCustomMessage
          message={
            "Historial actualizado correctamente. Refresca la pagina para ver los cambios"
          }
          type="success"
          onClick={() => toast.dismiss(t)}
          title="Accion exitosa"
        />
      ));
    } catch (e) {
      toast.custom((t) => (
        <ToastCustomMessage
          message="Error al actualizar el historial"
          type="error"
          onClick={() => toast.dismiss(t)}
          title="Error"
        />
      ));
    }
  };

  const handleDeleteHistory = async (historyId: string) => {
    try {
      //llamada a la accion
      const response = await deleteLeadHistoryById({ id: historyId });
      if (!response.ok) {
        toast.custom((t) => (
          <ToastCustomMessage
            message={response.message || "Error al eliminar el historial"}
            type="error"
            onClick={() => toast.dismiss(t)}
            title="Error"
          />
        ));
        return;
      }

      toast.custom((t) => (
        <ToastCustomMessage
          message={
            "Historial eliminado correctamente. Refresca la pagina para ver los cambios"
          }
          type="success"
          onClick={() => toast.dismiss(t)}
          title="Accion exitosa"
        />
      ));
    } catch (e) {
      toast.custom((t) => (
        <ToastCustomMessage
          message="Error al eliminar el historial"
          type="error"
          onClick={() => toast.dismiss(t)}
          title="Error"
        />
      ));
    }
  };

  return (
    <>
      <SheetContent className="sm:max-w-md">
        <div className="flex flex-col h-full">
          {/* Sección de cabecera con título y descripción */}
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="text-xl font-bold">
              {lead?.empresa || "Información del Lead"}
            </SheetTitle>
            <div className="flex items-center gap-3 mt-2">
              <Badge className={getStatusColor(lead?.status)} variant="outline">
                {leadStatusMap[lead?.status] || "Sin estado"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Creado:{" "}
                {lead?.createdAt
                  ? format(new Date(lead.createdAt), "dd MMM yyyy", {
                      locale: es,
                    })
                  : "N/A"}
              </span>
            </div>
          </SheetHeader>

          {/* Sección principal con información clave */}
          <div className="py-4 border-b">
            <div className="grid grid-cols-1 gap-3 w-full">
              <div className="flex justify-between">
                <h3 className="text-sm font-medium ">Sector</h3>
                <Badge variant="outline">
                  <p className="text-muted-foreground">
                    {lead?.sector.nombre || "No especificado"}
                  </p>
                </Badge>
              </div>
              <div className="flex justify-between">
                <h3 className="text-sm font-medium">Origen</h3>
                <Badge variant="outline">
                  <p className="text-muted-foreground">
                    {lead?.origen.nombre || "No especificado"}
                  </p>
                </Badge>
              </div>
              <div className="flex justify-between">
                <h3 className="text-sm font-medium">Fecha de Creacion</h3>
                <div className="flex items-center gap-1">
                  <Badge variant="outline">
                    <CalendarIcon className="h-3 w-3 mr-2" />
                    <span className="text-muted-foreground">
                      {format(lead.createdAt, "dd MMM yyyy", {
                        locale: es,
                      })}
                    </span>
                  </Badge>
                </div>
              </div>
              <div className="flex justify-between">
                <h3 className="text-sm font-medium">Dias transcurridos</h3>
                <Badge variant="outline">
                  <p className="text-muted-foreground">
                    {diffInDays} {diffInDays > 1 ? "dias" : "dia"}
                  </p>
                </Badge>
              </div>
              <div className="flex justify-between">
                <h3 className="text-sm font-medium">Generador</h3>
                <Badge variant="outline">
                  <p className="text-muted-foreground">
                    {lead.generadorLeads.name}
                  </p>
                </Badge>
              </div>

              <div className="flex justify-between">
                <h3 className="text-sm font-medium">Ubicacion</h3>
                <Badge variant="outline">
                  <p className="text-muted-foreground">
                    {lead?.ubicacion || "No especificado"}
                  </p>
                </Badge>
              </div>

              <div className="flex justify-between">
                <h3 className="text-sm font-medium">Numero de empleados</h3>
                <Badge variant="outline">
                  <p className="text-muted-foreground">
                    {getEmployeeCountDisplay(lead?.numero_empleados)}
                  </p>
                </Badge>
              </div>

              <div className="flex justify-between">
                <h3 className="text-sm font-medium">Subsector</h3>
                <Badge variant="outline">
                  <p className="text-muted-foreground">
                    {lead?.SubSector?.nombre || "No especificado"}
                  </p>
                </Badge>
              </div>
            </div>

            {lead?.link && (
              <div className="w-full flex justify-between items-center">
                <div className="mt-3">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Enlace
                  </h3>
                </div>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={linkVerify} target="_blank">
                      <LinkIcon
                        size={17}
                        className="underline cursor-pointer items-center text-center mr-3 text-blue-500"
                      />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>{linkVerify}</span>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>

          {/* Tabs para la información adicional */}
          <div className="flex-grow">
            <Tabs defaultValue="contacts" className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="contacts">Contactos</TabsTrigger>
                <TabsTrigger value="history">Historial</TabsTrigger>
              </TabsList>
              <TabsContent value="contacts" className="py-4">
                <div className="h-[400px] rounded-md border">
                  <ScrollArea className="h-full p-4">
                    {contactos?.length > 0 ? (
                      <div className="space-y-4 pr-4">
                        {contactos.map((contacto) => (
                          <ContactoCard
                            contacto={contacto}
                            key={contacto.id}
                            onUpdateContacts={setContactos}
                            updateLeadInState={updateLeadInState}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col justify-center items-center gap-2 py-8 h-full">
                        <UserX size={40} className="text-muted-foreground" />
                        <p className="text-sm text-muted-foreground text-center">
                          No hay contactos disponibles.
                        </p>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </TabsContent>
              <TabsContent value="history" className="py-4">
                <div className="h-[400px] rounded-md border">
                  <ScrollArea className="h-full p-4">
                    {loggedUser.role === Role.Admin && (
                      <Button
                        onClick={() => setAddHistoryDialog(true)}
                        variant="outline"
                        className="mb-3 w-full"
                      >
                        <Plus />
                        Agregar Historial
                      </Button>
                    )}
                    {lead?.statusHistory?.length > 0 ? (
                      <div className="space-y-3">
                        {lead.statusHistory.map((item, index) => (
                          <>
                            <Card
                              key={index}
                              className="group relative p-4 border border-border/50 hover:border-border transition-all duration-200 hover:shadow-sm bg-card/50 backdrop-blur-sm"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 space-y-2">
                                  {/* Status principal */}
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-primary/60"></div>
                                    <span className="font-medium text-foreground leading-tight">
                                      {leadStatusMap[item.status]}
                                    </span>
                                  </div>

                                  {/* Información secundaria */}
                                  <div className="space-y-1 pl-4">
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                      <span className="w-1 h-1 rounded-full bg-muted-foreground/40"></span>
                                      Por:{" "}
                                      <span className="font-medium">
                                        {item.changedBy.name}
                                      </span>
                                    </p>
                                    <p className="text-xs text-muted-foreground/80 font-mono">
                                      {format(
                                        new Date(item.changedAt),
                                        "dd/MM/yy HH:mm",
                                        { locale: es }
                                      )}
                                    </p>
                                  </div>
                                </div>

                                {/* Botón de edición */}
                                {loggedUser.role === Role.Admin && (
                                  <div className="flex flex-col items-center gap-2">
                                    <div className="shrink-0">
                                      <Button
                                        size={"icon"}
                                        variant="outline"
                                        onClick={() => {
                                          setHistoryEditing(item.id);
                                          setDialogEditOpen(true);
                                        }}
                                        aria-label="Editar"
                                      >
                                        <SquarePen className="text-muted-foreground hover:text-foreground transition-colors" />
                                      </Button>
                                    </div>
                                    <div className="shrink-0">
                                      <ConfirmDialog
                                        onConfirm={() =>
                                          handleDeleteHistory(item.id)
                                        }
                                        title="Eliminar Historial"
                                        description="¿Estás seguro de que deseas eliminar este historial? Esta acción no se puede deshacer."
                                        trigger={
                                          <Button
                                            onClick={() => {}}
                                            variant="destructive"
                                            size={"icon"}
                                          >
                                            <TrashIcon />
                                          </Button>
                                        }
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </Card>
                            <Dialog
                              key={index}
                              open={dialogEditOpen}
                              onOpenChange={setDialogEditOpen}
                            >
                              <DialogContent className="z-50">
                                <form
                                  onSubmit={handleSubmit(onSubmit)}
                                  className="space-y-4"
                                >
                                  <DialogHeader>
                                    <DialogTitle>
                                      Editar el Historial
                                    </DialogTitle>
                                    <DialogDescription>
                                      Al cambiar el historial, el resultado de
                                      los reportes se verá afectado.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="flex flex-col gap-2">
                                    <Label htmlFor="status" className="px-1">
                                      Status
                                    </Label>
                                    <Controller
                                      name="status"
                                      control={control}
                                      render={({ field }) => (
                                        <Select
                                          onValueChange={field.onChange}
                                          value={field.value}
                                        >
                                          <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Selecciona un estado" />
                                          </SelectTrigger>
                                          <SelectContent className="w-full">
                                            <SelectGroup>
                                              <SelectLabel>Estado</SelectLabel>
                                              <SelectItem
                                                value={LeadStatus.Contacto}
                                              >
                                                Contacto
                                              </SelectItem>
                                              <SelectItem
                                                value={LeadStatus.SocialSelling}
                                              >
                                                Social Selling
                                              </SelectItem>
                                              <SelectItem
                                                value={
                                                  LeadStatus.ContactoCalido
                                                }
                                              >
                                                Contacto Calido
                                              </SelectItem>
                                              <SelectItem
                                                value={LeadStatus.CitaAgendada}
                                              >
                                                Cita Agendada
                                              </SelectItem>
                                              <SelectItem
                                                value={LeadStatus.CitaAtendida}
                                              >
                                                Cita Atendida
                                              </SelectItem>
                                              <SelectItem
                                                value={LeadStatus.CitaValidada}
                                              >
                                                Cita Validada
                                              </SelectItem>
                                              <SelectItem
                                                value={LeadStatus.Asignadas}
                                              >
                                                Posiciones Asignadas
                                              </SelectItem>
                                              <SelectItem
                                                value={LeadStatus.StandBy}
                                              >
                                                Stand By
                                              </SelectItem>
                                            </SelectGroup>
                                          </SelectContent>
                                        </Select>
                                      )}
                                    />
                                    {errors.status && (
                                      <p className="text-sm text-red-500">
                                        {errors.status.message}
                                      </p>
                                    )}
                                  </div>
                                  <div className="space-y-2">
                                    <Controller
                                      name="changedAt"
                                      control={control}
                                      render={({ field }) => (
                                        <div className="flex flex-col gap-2">
                                          <Label htmlFor="date">
                                            Fecha de cambio
                                          </Label>
                                          <Popover>
                                            <PopoverTrigger asChild>
                                              <Button
                                                variant="outline"
                                                className={cn(
                                                  "w-full justify-start text-left font-normal",
                                                  !field.value &&
                                                    "text-muted-foreground"
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
                                            <PopoverContent
                                              className="w-auto p-0"
                                              align="start"
                                            >
                                              <Calendar
                                                mode="single"
                                                selected={new Date(field.value)}
                                                onSelect={(date) => {
                                                  field.onChange(
                                                    date?.toISOString()
                                                  );
                                                }}
                                                locale={es}
                                                captionLayout="dropdown"
                                              />
                                            </PopoverContent>
                                          </Popover>
                                          {errors.changedAt && (
                                            <p className="text-sm text-destructive">
                                              {errors.changedAt.message}
                                            </p>
                                          )}
                                        </div>
                                      )}
                                    />
                                  </div>
                                  <DialogFooter>
                                    <DialogClose asChild>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        disabled={isSubmitting}
                                      >
                                        Cancelar
                                      </Button>
                                    </DialogClose>
                                    <Button
                                      type="submit"
                                      disabled={isSubmitting}
                                    >
                                      {isSubmitting ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Guardando...
                                        </>
                                      ) : (
                                        "Guardar cambios"
                                      )}
                                    </Button>
                                  </DialogFooter>
                                </form>
                              </DialogContent>
                            </Dialog>
                          </>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center h-full">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                          <CalendarIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium mb-1">
                          Sin historial de cambios
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Los cambios de estado se registrarán aquí.
                        </p>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          {/* Footer con botones */}
        </div>

        {loggedUser.role === Role.Admin && (
          <AddHistoryDialog
            isOpen={addHistoryDialog}
            setIsOpen={setAddHistoryDialog}
            leadId={lead.id}
          />
        )}
      </SheetContent>
    </>
  );
}
