"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LeadReportData } from "@/actions/leads/reports";
import { Eye } from "lucide-react";

interface ReportColumnsProps {
  onShowDetails: (
    leads: any[],
    estado: string,
    generadorName: string,
    periodo: string
  ) => void;
}

export const createReportColumns = ({
  onShowDetails,
}: ReportColumnsProps): ColumnDef<LeadReportData>[] => [
  {
    accessorKey: "generadorName",
    header: "Generador de Leads",
    cell: ({ row }) => {
      return (
        <div className="font-medium text-gray-900">
          {row.getValue("generadorName")}
        </div>
      );
    },
  },
  {
    accessorKey: "periodo",
    header: "Período",
    cell: ({ row }) => {
      return (
        <div className="text-sm text-gray-600">{row.getValue("periodo")}</div>
      );
    },
  },
  {
    accessorKey: "contactos",
    header: "Contactos",
    cell: ({ row }) => {
      const value = row.getValue("contactos") as number;
      const rowData = row.original;

      if (value === 0) {
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-500">
            {value}
          </Badge>
        );
      }

      return (
        <Button
          variant="ghost"
          className="p-0 h-auto hover:bg-transparent"
          onClick={() =>
            onShowDetails(
              rowData.contactosDetails,
              "Contacto",
              rowData.generadorName,
              rowData.periodo
            )
          }
        >
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer transition-colors"
          >
            {value} <Eye className="ml-1 h-3 w-3" />
          </Badge>
        </Button>
      );
    },
  },
  {
    accessorKey: "socialSelling",
    header: "Social Selling",
    cell: ({ row }) => {
      const value = row.getValue("socialSelling") as number;
      const rowData = row.original;

      if (value === 0) {
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-500">
            {value}
          </Badge>
        );
      }

      return (
        <Button
          variant="ghost"
          className="p-0 h-auto hover:bg-transparent"
          onClick={() =>
            onShowDetails(
              rowData.socialSellingDetails,
              "SocialSelling",
              rowData.generadorName,
              rowData.periodo
            )
          }
        >
          <Badge
            variant="secondary"
            className="bg-purple-100 text-purple-800 hover:bg-purple-200 cursor-pointer transition-colors"
          >
            {value} <Eye className="ml-1 h-3 w-3" />
          </Badge>
        </Button>
      );
    },
  },
  {
    accessorKey: "contactoCalido",
    header: "Contacto Cálido",
    cell: ({ row }) => {
      const value = row.getValue("contactoCalido") as number;
      const rowData = row.original;

      if (value === 0) {
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-500">
            {value}
          </Badge>
        );
      }

      return (
        <Button
          variant="ghost"
          className="p-0 h-auto hover:bg-transparent"
          onClick={() =>
            onShowDetails(
              rowData.contactoCalidoDetails,
              "ContactoCalido",
              rowData.generadorName,
              rowData.periodo
            )
          }
        >
          <Badge
            variant="secondary"
            className="bg-orange-100 text-orange-800 hover:bg-orange-200 cursor-pointer transition-colors"
          >
            {value} <Eye className="ml-1 h-3 w-3" />
          </Badge>
        </Button>
      );
    },
  },
  {
    accessorKey: "citaAgendada",
    header: "Cita Agendada",
    cell: ({ row }) => {
      const value = row.getValue("citaAgendada") as number;
      const rowData = row.original;

      if (value === 0) {
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-500">
            {value}
          </Badge>
        );
      }

      return (
        <Button
          variant="ghost"
          className="p-0 h-auto hover:bg-transparent"
          onClick={() =>
            onShowDetails(
              rowData.citaAgendadaDetails,
              "CitaAgendada",
              rowData.generadorName,
              rowData.periodo
            )
          }
        >
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 cursor-pointer transition-colors"
          >
            {value} <Eye className="ml-1 h-3 w-3" />
          </Badge>
        </Button>
      );
    },
  },
  {
    accessorKey: "citaAtendida",
    header: "Cita Atendida",
    cell: ({ row }) => {
      const value = row.getValue("citaAtendida") as number;
      const rowData = row.original;

      if (value === 0) {
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-500">
            {value}
          </Badge>
        );
      }

      return (
        <Button
          variant="ghost"
          className="p-0 h-auto hover:bg-transparent"
          onClick={() =>
            onShowDetails(
              rowData.citaAtendidaDetails,
              "CitaAtendida",
              rowData.generadorName,
              rowData.periodo
            )
          }
        >
          <Badge
            variant="secondary"
            className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 cursor-pointer transition-colors"
          >
            {value} <Eye className="ml-1 h-3 w-3" />
          </Badge>
        </Button>
      );
    },
  },
  {
    accessorKey: "citaValidada",
    header: "Cita Validada",
    cell: ({ row }) => {
      const value = row.getValue("citaValidada") as number;
      const rowData = row.original;

      if (value === 0) {
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-500">
            {value}
          </Badge>
        );
      }

      return (
        <Button
          variant="ghost"
          className="p-0 h-auto hover:bg-transparent"
          onClick={() =>
            onShowDetails(
              rowData.citaValidadaDetails,
              "CitaValidada",
              rowData.generadorName,
              rowData.periodo
            )
          }
        >
          <Badge
            variant="secondary"
            className="bg-teal-100 text-teal-800 hover:bg-teal-200 cursor-pointer transition-colors"
          >
            {value} <Eye className="ml-1 h-3 w-3" />
          </Badge>
        </Button>
      );
    },
  },
  {
    accessorKey: "asignadas",
    header: "Asignadas",
    cell: ({ row }) => {
      const value = row.getValue("asignadas") as number;
      const rowData = row.original;

      if (value === 0) {
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-500">
            {value}
          </Badge>
        );
      }

      return (
        <Button
          variant="ghost"
          className="p-0 h-auto hover:bg-transparent"
          onClick={() =>
            onShowDetails(
              rowData.asignadasDetails,
              "Asignadas",
              rowData.generadorName,
              rowData.periodo
            )
          }
        >
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer transition-colors"
          >
            {value} <Eye className="ml-1 h-3 w-3" />
          </Badge>
        </Button>
      );
    },
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => {
      const value = row.getValue("total") as number;
      return (
        <Badge
          variant="default"
          className="bg-gray-800 text-white font-semibold"
        >
          {value}
        </Badge>
      );
    },
  },
];

// Columnas básicas para compatibilidad hacia atrás (sin funcionalidad de drill-down)
export const reportColumns: ColumnDef<LeadReportData>[] = createReportColumns({
  onShowDetails: () => {
    console.warn("onShowDetails not implemented");
  },
});
