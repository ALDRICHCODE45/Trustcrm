"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { LeadReportData } from "@/actions/leads/reports";

export const reportColumns: ColumnDef<LeadReportData>[] = [
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
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          {value}
        </Badge>
      );
    },
  },
  {
    accessorKey: "socialSelling",
    header: "Social Selling",
    cell: ({ row }) => {
      const value = row.getValue("socialSelling") as number;
      return (
        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
          {value}
        </Badge>
      );
    },
  },
  {
    accessorKey: "contactoCalido",
    header: "Contacto Cálido",
    cell: ({ row }) => {
      const value = row.getValue("contactoCalido") as number;
      return (
        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
          {value}
        </Badge>
      );
    },
  },
  {
    accessorKey: "citaAgendada",
    header: "Cita Agendada",
    cell: ({ row }) => {
      const value = row.getValue("citaAgendada") as number;
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          {value}
        </Badge>
      );
    },
  },
  {
    accessorKey: "citaAtendida",
    header: "Cita Atendida",
    cell: ({ row }) => {
      const value = row.getValue("citaAtendida") as number;
      return (
        <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
          {value}
        </Badge>
      );
    },
  },
  {
    accessorKey: "citaValidada",
    header: "Cita Validada",
    cell: ({ row }) => {
      const value = row.getValue("citaValidada") as number;
      return (
        <Badge variant="secondary" className="bg-teal-100 text-teal-800">
          {value}
        </Badge>
      );
    },
  },
  {
    accessorKey: "asignadas",
    header: "Asignadas",
    cell: ({ row }) => {
      const value = row.getValue("asignadas") as number;
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          {value}
        </Badge>
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
