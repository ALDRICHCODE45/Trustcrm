"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { CuentasActions } from "./components/CuentasActions";

/**
 * Falta implementar las facturas, ESTE APARTADO TIENE DATOS DE PRUEBA.
 *
 */
export const cuentaColumns: ColumnDef<any>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
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
    accessorKey: "fecha",
    header: "Fecha",
  },
  {
    accessorKey: "concepto",
    header: "Concepto",
  },
  {
    accessorKey: "detalle",
    header: "Detalle",
  },
  {
    accessorKey: "subtotal",
    header: "Subtotal",
    cell: ({ row }) => {
      const subtotal = row.original.subtotal;
      return <span className="font-semibold">${subtotal}</span>;
    },
  },
  {
    accessorKey: "iva",
    header: "Iva",
    cell: ({ row }) => {
      const iva = row.original.iva;
      return <span className="font-semibold">${iva}</span>;
    },
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => {
      const total = row.original.total;
      return <span className="font-semibold">${total}</span>;
    },
  },
  {
    id: "actions",
    cell: () => {
      return <CuentasActions />;
    },
  },
];
