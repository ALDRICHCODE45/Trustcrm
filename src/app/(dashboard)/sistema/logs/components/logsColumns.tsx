"use client";
import { Badge } from "@/components/ui/badge";
import { Prisma } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { UserCog, File, Fingerprint, Clock, Calendar } from "lucide-react";
import { LogsColumnsActions } from "./logColumnsActions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { es } from "date-fns/locale";

export type LogWithRelations = Prisma.LogGetPayload<{
  include: {
    autor: true;
  };
}>;

export const logsColumns: ColumnDef<LogWithRelations>[] = [
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
    accessorKey: "autorId",
    header: "User Id",
    cell: ({ row }) => {
      const userId = row.original.autorId as string;
      return (
        <div className="flex flex-row gap-2 items-center">
          <Fingerprint size={18} />
          <span>{userId}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "autor",
    header: "Nombre del Usuario",
    cell: ({ row }) => {
      const username = row.original.autor.name as string;
      return (
        <div className="flex flex-row gap-2 items-center">
          <UserCog size={18} />
          <span>{username}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "action",
    header: "Accion Realizada",
    cell: ({ row }) => {
      const action = row.original.action;
      return (
        <Badge variant="outline" className="gap-1.5">
          <span
            className="size-1.5 rounded-full bg-emerald-500"
            aria-hidden="true"
          ></span>
          {action}
        </Badge>
      );
    },
  },
  {
    accessorKey: "file",
    header: "Archivo",
    cell: ({ row }) => {
      const fileName = row.original.file;
      return (
        <div className="flex gap-2 items-center">
          {typeof fileName === "string" && fileName.length > 0 ? (
            <>
              <Link href={fileName} target="_blank">
                <File size={18} />
              </Link>
            </>
          ) : (
            <span className="text-muted-foreground italic">Sin archivo</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "logModule",
    header: "Modulo",
    cell: ({ row }) => {
      const logModule = row.original.logModule;
      return (
        <>
          <Button variant="outline">{logModule}</Button>
        </>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Fecha",
    cell: ({ row }) => {
      const fecha = row.original.createdAt;
      return (
        <div className="flex gap-2 items-center">
          <Calendar size={18} />
          <span>{format(fecha, "EEE dd/MMMM/yyyy", { locale: es })}</span>
        </div>
      );
    },
  },
  {
    id: "Hora",
    header: "Hora",
    cell: ({ row }) => {
      const hora = row.original.createdAt;
      return (
        <div className="flex items-center gap-2">
          <Clock size={18} />
          <span>{format(hora, "h:mmaaa")}</span>
        </div>
      );
    },
  },

  {
    id: "actions",
    cell: ({ row }) => {
      return <LogsColumnsActions row={row} />;
    },
  },
];
