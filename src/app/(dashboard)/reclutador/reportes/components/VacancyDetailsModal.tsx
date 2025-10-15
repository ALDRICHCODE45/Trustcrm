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
import { VacancyDetail } from "@/actions/vacantes/reports";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Building2 } from "lucide-react";

interface VacancyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vacancies: VacancyDetail[];
  estado: string;
  reclutadorName: string;
  periodo: string;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "quickmeeting":
      return "bg-purple-100 text-purple-800";
    case "hunting":
      return "bg-orange-100 text-orange-800";
    case "entrevistas":
      return "bg-yellow-100 text-yellow-800";
    case "preplacement":
      return "bg-indigo-100 text-indigo-800";
    case "placement":
      return "bg-green-100 text-green-800";
    case "cancelada":
      return "bg-red-100 text-red-800";
    case "perdida":
      return "bg-gray-100 text-gray-800";
    case "standby":
      return "bg-pink-100 text-pink-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatStatusName = (status: string) => {
  const statusMap: { [key: string]: string } = {
    QuickMeeting: "Quick Meeting",
    Hunting: "Hunting",
    Entrevistas: "Entrevistas",
    PrePlacement: "Pre-Placement",
    Placement: "Placement",
    Cancelada: "Cancelada",
    Perdida: "Perdida",
    StandBy: "Stand By",
  };
  return statusMap[status] || status;
};

export function VacancyDetailsModal({
  isOpen,
  onClose,
  vacancies,
  estado,
  reclutadorName,
  periodo,
}: VacancyDetailsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{formatStatusName(estado)}</span>
            <Badge variant="outline" className="text-sm">
              {vacancies.length}{" "}
              {vacancies.length === 1 ? "vacante" : "vacantes"}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Detalles de vacantes en estado{" "}
            <strong>{formatStatusName(estado)}</strong> para{" "}
            <strong>{reclutadorName}</strong> - {periodo}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-between items-center py-2">
          <div className="text-sm text-gray-600">
            Mostrando {vacancies.length}{" "}
            {vacancies.length === 1 ? "resultado" : "resultados"}
          </div>
        </div>

        <div className="flex-1 overflow-auto border rounded-lg">
          <Table>
            <TableHeader className="sticky top-0 ">
              <TableRow>
                <TableHead>Posición</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead>Estado en Período</TableHead>
                <TableHead>Estado Actual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vacancies.map((vacancy) => (
                <TableRow key={vacancy.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="font-medium">{vacancy.posicion}</div>
                    <div className="text-xs text-gray-700">
                      ID: {vacancy.id.slice(0, 8)}...
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-600" />
                      <span className="text-sm">{vacancy.clienteNombre}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-700" />
                      <span className="text-sm">
                        {format(new Date(vacancy.createdAt), "dd/MM/yyyy", {
                          locale: es,
                        })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getStatusColor(vacancy.statusInPeriod)}
                    >
                      {formatStatusName(vacancy.statusInPeriod)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        vacancy.currentStatus !== vacancy.statusInPeriod
                          ? "border-orange-300 text-orange-700"
                          : ""
                      }
                    >
                      {formatStatusName(vacancy.currentStatus)}
                    </Badge>
                    {vacancy.currentStatus !== vacancy.statusInPeriod && (
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

        {vacancies.length === 0 && (
          <div className="flex-1 flex items-center justify-center py-8">
            <div className="text-center text-gray-600">
              <div className="text-lg font-medium mb-2">
                No hay vacantes en este estado
              </div>
              <div className="text-sm">
                No se encontraron vacantes en estado {formatStatusName(estado)}{" "}
                para este período.
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
