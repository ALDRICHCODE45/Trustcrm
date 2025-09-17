"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LeadDetail } from "@/actions/leads/reports";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Copy, ExternalLink, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface LeadDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: LeadDetail[];
  estado: string;
  generadorName: string;
  periodo: string;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "contacto":
      return "bg-blue-100 text-blue-800";
    case "socialselling":
      return "bg-purple-100 text-purple-800";
    case "contactocalido":
      return "bg-orange-100 text-orange-800";
    case "citaagendada":
      return "bg-yellow-100 text-yellow-800";
    case "citaatendida":
      return "bg-indigo-100 text-indigo-800";
    case "citavalidada":
      return "bg-teal-100 text-teal-800";
    case "asignadas":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatStatusName = (status: string) => {
  const statusMap: { [key: string]: string } = {
    Contacto: "Contacto",
    SocialSelling: "Social Selling",
    ContactoCalido: "Contacto Cálido",
    CitaAgendada: "Cita Agendada",
    CitaAtendida: "Cita Atendida",
    CitaValidada: "Cita Validada",
    Asignadas: "Asignadas",
  };
  return statusMap[status] || status;
};

export function LeadDetailsModal({
  isOpen,
  onClose,
  leads,
  estado,
  generadorName,
  periodo,
}: LeadDetailsModalProps) {
  const handleCopyLeadId = (leadId: string) => {
    navigator.clipboard.writeText(leadId);
    toast({
      title: "ID copiado",
      description: "El ID del lead se ha copiado al portapapeles",
    });
  };

  const handleCopyAllEmpresas = () => {
    const empresas = leads.map((lead) => lead.empresa).join("\n");
    navigator.clipboard.writeText(empresas);
    toast({
      title: "Lista copiada",
      description: `Se copiaron ${leads.length} nombres de empresas`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{formatStatusName(estado)}</span>
            <Badge variant="outline" className="text-sm">
              {leads.length} {leads.length === 1 ? "lead" : "leads"}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Detalles de leads en estado{" "}
            <strong>{formatStatusName(estado)}</strong> para{" "}
            <strong>{generadorName}</strong> - {periodo}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-between items-center py-2">
          <div className="text-sm text-gray-600">
            Mostrando {leads.length}{" "}
            {leads.length === 1 ? "resultado" : "resultados"}
          </div>
        </div>

        <div className="flex-1 overflow-auto border rounded-lg">
          <Table>
            <TableHeader className="sticky top-0 bg-white">
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead>Estado en Período</TableHead>
                <TableHead>Estado Actual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead, index) => (
                <TableRow key={lead.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="font-medium">{lead.empresa}</div>
                    <div className="text-xs text-gray-500">
                      ID: {lead.id.slice(0, 8)}...
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        {format(new Date(lead.createdAt), "dd/MM/yyyy", {
                          locale: es,
                        })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getStatusColor(lead.statusInPeriod)}
                    >
                      {formatStatusName(lead.statusInPeriod)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        lead.currentStatus !== lead.statusInPeriod
                          ? "border-orange-300 text-orange-700"
                          : ""
                      }
                    >
                      {formatStatusName(lead.currentStatus)}
                    </Badge>
                    {lead.currentStatus !== lead.statusInPeriod && (
                      <div className="text-xs text-orange-600 mt-1">
                        Estado cambió
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {leads.length === 0 && (
          <div className="flex-1 flex items-center justify-center py-8">
            <div className="text-center text-gray-500">
              <div className="text-lg font-medium mb-2">
                No hay leads en este estado
              </div>
              <div className="text-sm">
                No se encontraron leads en estado {formatStatusName(estado)}{" "}
                para este período.
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
