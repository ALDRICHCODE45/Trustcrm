import { LeadStatus, User } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/core/lib/utils";
import { leadStatusMap } from "@/app/(dashboard)/list/leads/components/LeadChangeStatus";

interface LeadCardProps {
  leadId: string;
  lead: {
    empresa: string;

    estados: Array<{
      status: LeadStatus;
      date: Date;
      type: string;
      generador: User;
    }>;
    generador: User;
  };
}

export function LeadCard({ leadId, lead }: LeadCardProps) {
  // Función para obtener el color del badge según el estado
  const getStatusColor = (status: LeadStatus) => {
    const statusColors = {
      [LeadStatus.Contacto]: "bg-slate-500 hover:bg-slate-600",
      [LeadStatus.SocialSelling]: "bg-blue-500 hover:bg-blue-600",
      [LeadStatus.ContactoCalido]: "bg-yellow-500 hover:bg-yellow-600",
      [LeadStatus.CitaAgendada]: "bg-purple-500 hover:bg-purple-600",
      [LeadStatus.CitaValidada]: "bg-pink-500 hover:bg-pink-600",
      [LeadStatus.Asignadas]: "bg-green-500 hover:bg-green-600",
      [LeadStatus.StandBy]: "bg-red-500 hover:bg-red-600",
      [LeadStatus.CitaAtendida]: "bg-gray-500",
    };
    return statusColors[status] || "bg-gray-500";
  };

  return (
    <Card className="shadow-lg flex flex-col h-full hover:shadow-xl transition-shadow border-slate-200 dark:border-slate-700 overflow-hidden">
      <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            {lead.empresa}
          </CardTitle>
          <Badge
            variant="outline"
            className="text-xs px-2 py-0 border-slate-300 dark:border-slate-600"
          >
            ID: {leadId.substring(0, 8)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 flex-1 overflow-y-auto">
        <div className="space-y-3">
          {lead.estados.map((estado, idx) => (
            <div
              key={idx}
              className={cn(
                "flex justify-between items-center py-2 px-3 rounded-md",
                idx % 2 === 0 ? "bg-slate-50 dark:bg-slate-800/50" : ""
              )}
            >
              <Badge
                className={cn(
                  "text-white font-medium px-2 py-1 transition-colors",
                  getStatusColor(estado.status)
                )}
              >
                {leadStatusMap[estado.status]}
              </Badge>

              <div className="flex flex-col items-end text-right">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {format(estado.date, "dd MMM yyyy", {
                    locale: es,
                  })}
                </span>
                <div className="flex gap-3">
                  <div className="flex gap-2 items-center">
                    <UserIcon size={13} className="text-gray-600" />
                    <span className="text-xs">{estado.generador.name}</span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {format(estado.date, "HH:mm", {
                      locale: es,
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-2 pb-4 px-6 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/30">
        {lead.estados.length} actualizaciones
      </CardFooter>
    </Card>
  );
}
