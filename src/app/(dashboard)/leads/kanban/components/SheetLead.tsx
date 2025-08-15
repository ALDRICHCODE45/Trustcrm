import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, LinkIcon, UserX } from "lucide-react";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeadWithRelations } from "../page";
import { LeadStatus } from "@prisma/client";
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
  const [linkVerify, setLinkVerfy] = useState(lead.link);

  useEffect(() => {
    if (!/^https?:\/\//i.test(lead.link)) {
      setLinkVerfy(`https://${lead.link}`);
    }
  }, [lead]);

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
                    {lead?.statusHistory?.length > 0 ? (
                      <div className="space-y-3 pr-4">
                        {lead.statusHistory.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center text-sm border-b pb-3"
                          >
                            <div>
                              <span className="font-medium">
                                {leadStatusMap[item.status]}
                              </span>
                              <p className="text-muted-foreground text-xs">
                                Por: {item.changedBy.name}
                              </p>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {format(
                                new Date(item.changedAt),
                                "dd/MM/yy HH:mm",
                                { locale: es }
                              )}
                            </span>
                          </div>
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
      </SheetContent>
    </>
  );
}
