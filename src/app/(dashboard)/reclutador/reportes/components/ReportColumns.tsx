"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VacancyReportData } from "@/actions/vacantes/reports";
import { Eye } from "lucide-react";

interface ReportColumnsProps {
  onShowDetails: (
    vacancies: any[],
    estado: string,
    reclutadorName: string,
    periodo: string
  ) => void;
}

export const createReportColumns = ({
  onShowDetails,
}: ReportColumnsProps): ColumnDef<VacancyReportData>[] => [
  {
    accessorKey: "reclutadorName",
    header: "Reclutador",
    cell: ({ row }) => {
      return (
        <div className="font-medium text-gray-900">
          {row.getValue("reclutadorName")}
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
    accessorKey: "quickMeeting",
    header: "Quick Meeting",
    cell: ({ row }) => {
      const value = row.getValue("quickMeeting") as number;
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
              rowData.quickMeetingDetails,
              "QuickMeeting",
              rowData.reclutadorName,
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
    accessorKey: "hunting",
    header: "Hunting",
    cell: ({ row }) => {
      const value = row.getValue("hunting") as number;
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
              rowData.huntingDetails,
              "Hunting",
              rowData.reclutadorName,
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
    accessorKey: "entrevistas",
    header: "Entrevistas",
    cell: ({ row }) => {
      const value = row.getValue("entrevistas") as number;
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
              rowData.entrevistasDetails,
              "Entrevistas",
              rowData.reclutadorName,
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
    accessorKey: "prePlacement",
    header: "Pre-Placement",
    cell: ({ row }) => {
      const value = row.getValue("prePlacement") as number;
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
              rowData.prePlacementDetails,
              "PrePlacement",
              rowData.reclutadorName,
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
    accessorKey: "placement",
    header: "Placement",
    cell: ({ row }) => {
      const value = row.getValue("placement") as number;
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
              rowData.placementDetails,
              "Placement",
              rowData.reclutadorName,
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
    accessorKey: "cancelada",
    header: "Canceladas",
    cell: ({ row }) => {
      const value = row.getValue("cancelada") as number;
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
              rowData.canceladaDetails,
              "Cancelada",
              rowData.reclutadorName,
              rowData.periodo
            )
          }
        >
          <Badge
            variant="secondary"
            className="bg-red-100 text-red-800 hover:bg-red-200 cursor-pointer transition-colors"
          >
            {value} <Eye className="ml-1 h-3 w-3" />
          </Badge>
        </Button>
      );
    },
  },
  {
    accessorKey: "perdida",
    header: "Perdidas",
    cell: ({ row }) => {
      const value = row.getValue("perdida") as number;
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
              rowData.perdidaDetails,
              "Perdida",
              rowData.reclutadorName,
              rowData.periodo
            )
          }
        >
          <Badge
            variant="secondary"
            className="bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer transition-colors"
          >
            {value} <Eye className="ml-1 h-3 w-3" />
          </Badge>
        </Button>
      );
    },
  },
  {
    accessorKey: "standBy",
    header: "Stand By",
    cell: ({ row }) => {
      const value = row.getValue("standBy") as number;
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
              rowData.standByDetails,
              "StandBy",
              rowData.reclutadorName,
              rowData.periodo
            )
          }
        >
          <Badge
            variant="secondary"
            className="bg-pink-100 text-pink-800 hover:bg-pink-200 cursor-pointer transition-colors"
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
export const reportColumns: ColumnDef<VacancyReportData>[] =
  createReportColumns({
    onShowDetails: () => {
      console.warn("onShowDetails not implemented");
    },
  });
