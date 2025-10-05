"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { DatosClienteDrawer } from "./components/DatosCliente";
import { DatosVacantesDrawer } from "./components/DatosVacanteDrawer";
import { ActionsFactura } from "./components/ActionsFactura";

/**
 * Las factuars aun no estan implementadas, utilizamos por el momento any para los datos
 * y pasamos [un array vacio] para que no de error
 *
 */

export const facturasColumns: ColumnDef<any>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select All"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "folio",
    header: "Folio",
  },
  {
    accessorKey: "tipo",
    header: "Tipo",
  },
  {
    accessorKey: "fecha_emision",
    header: "Fecha Emision",
  },
  {
    accessorKey: "fecha_pago",
    header: "Fecha Pago",
  },
  {
    accessorKey: "status",
    header: "Estado",
  },
  {
    accessorKey: "complemento",
    header: "Complemento",
    cell: ({ row }) => {
      const complemento = row.original.complemento;
      return <>{complemento ? <span>SI</span> : <span>NO</span>}</>;
    },
  },
  {
    accessorKey: "anticipo",
    header: "Anticipo",
  },
  {
    accessorKey: "banco",
    header: "Banco",
  },
  {
    accessorKey: "clientId",
    header: "Datos Cliente",
    cell: ({ row }) => {
      return <DatosClienteDrawer row={row} />;
    },
  },

  {
    accessorKey: "vacanteId",
    header: "Datos Vacante",
    cell: ({ row }) => {
      return <DatosVacantesDrawer row={row} />;
    },
  },
  {
    id: "actions", // Nueva columna de acciones
    cell: () => {
      return <ActionsFactura />;
    },
  },
];
