"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronDown, ChevronUp, SortAsc } from "lucide-react";
import { CommentSheet } from "./components/CommentSheet";
import { StatusDropdown } from "./components/StatusDropdown";
import { RecruiterDropDown } from "./components/RecruiterDropdown";
import { TypeDropdown } from "./components/TypeDropDown";
import { ActionsRecruitment } from "./components/ActionsRecruitment";
import { PosicionPopOver } from "./components/PosicionPopOver";
import { ClientesDropDown } from "./components/ClientesDropdown";
import { ChangeDateComponent } from "./components/AsignacionDatePickerComponent";
import { VacancyWithRelations } from "../../reclutador/components/ReclutadorColumns";

// headers ordenables
const SortableHeader = ({ column, title }: { column: any; title: string }) => {
  return (
    <div
      className="flex items-center cursor-pointer"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title}
      {column.getIsSorted() === "asc" ? (
        <ChevronUp className="ml-2 h-4 w-4" />
      ) : column.getIsSorted() === "desc" ? (
        <ChevronDown className="ml-2 h-4 w-4" />
      ) : (
        <SortAsc className="ml-2 h-4 w-4 " />
      )}
    </div>
  );
};
export const vacantesColumns: ColumnDef<VacancyWithRelations>[] = [
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
    id: "asignacion",
    header: "Asignacion",
    accessorKey: "fechaAsignacion",
    cell: ({ row }) => {
      return (
        <ChangeDateComponent
          fecha={row.original.fechaAsignacion}
          onFechaChange={(nuevaFecha) => {
            // Aquí implementarías la lógica para actualizar la fecha en tu fuente de datos
            console.log("Fecha actualizada:", nuevaFecha);
          }}
        />
      );
    },
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue || (!filterValue.from && !filterValue.to)) {
        return true;
      }

      const cellValue = row.getValue(columnId);
      if (!cellValue) return false;

      let date: Date;
      if (typeof cellValue === "string") {
        date = new Date(cellValue);
      } else if (cellValue instanceof Date) {
        date = cellValue;
      } else {
        return false;
      }

      const dateOnly = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );

      const fromDate = filterValue.from
        ? new Date(
            filterValue.from.getFullYear(),
            filterValue.from.getMonth(),
            filterValue.from.getDate()
          )
        : null;

      const toDate = filterValue.to
        ? new Date(
            filterValue.to.getFullYear(),
            filterValue.to.getMonth(),
            filterValue.to.getDate()
          )
        : null;

      if (fromDate && toDate) {
        return dateOnly >= fromDate && dateOnly <= toDate;
      } else if (fromDate) {
        return dateOnly >= fromDate;
      } else if (toDate) {
        return dateOnly <= toDate;
      }

      return true;
    },
  },
  {
    id: "reclutador",
    header: ({ column }) => (
      <SortableHeader column={column} title="Reclutador" />
    ),
    cell: ({ row }) => {
      return <RecruiterDropDown row={row} />;
    },
    accessorFn: (row) => row.reclutador?.id,
    filterFn: (row, _columnId, filterValue) => {
      if (
        !filterValue ||
        !Array.isArray(filterValue) ||
        filterValue.length === 0
      ) {
        return true;
      }
      const reclutadorId = row.original.reclutador?.id;
      if (!reclutadorId) return false;
      return filterValue.includes(reclutadorId);
    },
    enableGlobalFilter: true,
  },
  {
    id: "tipo",
    header: ({ column }) => <SortableHeader column={column} title="Tipo" />,
    cell: ({ row }) => {
      return <TypeDropdown row={row} />;
    },
    accessorFn: (row) => row.tipo,
    filterFn: (row, _columnId, filterValue) => {
      if (
        !filterValue ||
        !Array.isArray(filterValue) ||
        filterValue.length === 0
      ) {
        return true;
      }
      const tipo = row.original.tipo;
      if (!tipo) return false;
      return filterValue.includes(tipo);
    },
    enableGlobalFilter: true,
  },
  {
    id: "cliente",
    header: ({ column }) => <SortableHeader column={column} title="Cliente" />,
    cell: ({ row }) => {
      return <ClientesDropDown row={row} />;
    },
    accessorFn: (row) => row.cliente?.id,
    filterFn: (row, _columnId, filterValue) => {
      if (
        !filterValue ||
        !Array.isArray(filterValue) ||
        filterValue.length === 0
      ) {
        return true;
      }
      const clienteId = row.original.cliente?.id;
      if (!clienteId) return false;
      return filterValue.includes(clienteId);
    },
    enableGlobalFilter: true,
  },
  {
    id: "estado",
    header: ({ column }) => <SortableHeader column={column} title="Estado" />,
    cell: ({ row }) => {
      return <StatusDropdown row={row} />;
    },
    accessorFn: (row) => row.estado,
    filterFn: (row, _columnId, filterValue) => {
      if (
        !filterValue ||
        !Array.isArray(filterValue) ||
        filterValue.length === 0
      ) {
        return true;
      }
      const estado = row.original.estado;
      if (!estado) return false;
      return filterValue.includes(estado);
    },

    enableGlobalFilter: true,
  },
  {
    id: "posicion",
    header: ({ column }) => <SortableHeader column={column} title="Posicion" />,
    cell: ({ row }) => {
      return <PosicionPopOver row={row} />;
    },
    accessorFn: (row) => row.posicion,
    enableGlobalFilter: true,
  },
  {
    id: "comentarios",
    header: "Comentarios",
    cell: ({ row }) => (
      <CommentSheet
        vacancyId={row.original.id}
        vacancyOwnerId={row.original.reclutador.id}
      />
    ),
    accessorFn: (row) => row.Comments?.map((c) => c.content).join(" ") || "",
    enableGlobalFilter: true,
  },
  {
    accessorKey: "fechaUltimaTerna",
    header: ({ column }) => (
      <SortableHeader column={column} title="Fecha Terna" />
    ),
    cell: ({ row }) => {
      return (
        <ChangeDateComponent
          fecha={row.original.fechaAsignacion}
          onFechaChange={(nuevaFecha) => {
            // Aquí implementarías la lógica para actualizar la fecha en tu fuente de datos
            console.log("Fecha actualizada:", nuevaFecha);
          }}
        />
      );
    },
  },
  {
    accessorKey: "tiempoTranscurrido",
    header: ({ column }) => (
      <SortableHeader column={column} title="Tiempo trranscurrido" />
    ),
    cell: ({ row }) => {
      const tiempo = row.original.tiempoTranscurrido;
      return <span>{tiempo} días</span>;
    },
    accessorFn: (row) => row.tiempoTranscurrido?.toString(),
    enableGlobalFilter: true,
  },
  {
    accessorKey: "fechaOferta",
    header: ({ column }) => (
      <SortableHeader column={column} title="Fecha oferta" />
    ),
    cell: ({ row }) => {
      return (
        <ChangeDateComponent
          fecha={row.original.fechaAsignacion}
          onFechaChange={(nuevaFecha) => {
            // Aquí implementarías la lógica para actualizar la fecha en tu fuente de datos
            console.log("Fecha actualizada:", nuevaFecha);
          }}
        />
      );
    },
  },
  {
    accessorKey: "candidatoContratado",
    header: "Finalista",
    cell: ({ row }) => (
      <div>
        {row.original.candidatoContratado ? (
          <p>{row.original.candidatoContratado.name}</p>
        ) : (
          <p className="text-red-500">N.A</p>
        )}
      </div>
    ),
    accessorFn: (row) => row.candidatoContratado?.name || "N.A",
    enableGlobalFilter: true,
  },
  {
    accessorKey: "salario",
    header: ({ column }) => <SortableHeader column={column} title="Salario" />,
    cell: ({ row }) => {
      const salario = row.original.salario;
      return <span>${salario}</span>;
    },
    accessorFn: (row) => row.salario?.toString(),
    enableGlobalFilter: true,
  },
  {
    accessorKey: "fechaComision",
    header: ({ column }) => (
      <SortableHeader column={column} title="Fecha comision" />
    ),
    cell: ({ row }) => {
      return (
        <ChangeDateComponent
          fecha={row.original.fechaAsignacion}
          onFechaChange={(nuevaFecha) => {
            // Aquí implementarías la lógica para actualizar la fecha en tu fuente de datos
            console.log("Fecha actualizada:", nuevaFecha);
          }}
        />
      );
    },
  },
  {
    accessorKey: "valorFactura",
    header: ({ column }) => (
      <SortableHeader column={column} title="Valor factura" />
    ),
    accessorFn: (row) => row.valorFactura?.toString(),
    enableGlobalFilter: true,
  },
  {
    accessorKey: "fee",
    header: ({ column }) => <SortableHeader column={column} title="Fee" />,
    cell: ({ row }) => {
      const fee = row.original.fee;
      return <span>{fee}%</span>;
    },
    accessorFn: (row) => row.fee?.toString(),
    enableGlobalFilter: true,
  },
  {
    accessorKey: "monto",
    header: ({ column }) => <SortableHeader column={column} title="Monto" />,
    accessorFn: (row) => row.monto?.toString(),
    enableGlobalFilter: true,
  },
  // {
  //   accessorKey: "checklist",
  //   header: "Checklist",
  //   cell: ({ row }) => (
  //     <a
  //       href={row.original.checklist}
  //       target="_blank"
  //       rel="noopener noreferrer"
  //     >
  //       <Button variant="outline">
  //         <BookCheck />
  //       </Button>
  //     </a>
  //   ),
  // },
  // {
  //   accessorKey: "muestraPerfil",
  //   header: "Job Description",
  //   cell: ({ row }) => (
  //     <a
  //       href={row.original.muestraPerfil}
  //       target="_blank"
  //       rel="noopener noreferrer"
  //     >
  //       <Button variant="outline">
  //         <UserPen />
  //       </Button>
  //     </a>
  //   ),
  // },
  // {
  //   accessorKey: "ternaFinal",
  //   header: "Terna Final",
  //   cell: ({ row }) => <FinalTernaSheet ternaFinal={row.original.ternaFinal} />,
  // },
  {
    accessorKey: "duracionTotal",
    header: ({ column }) => (
      <SortableHeader column={column} title="Duración Total" />
    ),
    cell: ({ row }) => {
      const total = row.original.duracionTotal;
      return <span>{total} días</span>;
    },
    accessorFn: (row) => row.duracionTotal?.toString(),
    enableGlobalFilter: true,
  },
  {
    id: "oficina",
    cell: () => null,
    header: () => null,
    accessorFn: (row) => row.reclutador?.Oficina,
    filterFn: (row, _columnId, filterValue) => {
      if (
        !filterValue ||
        !Array.isArray(filterValue) ||
        filterValue.length === 0
      ) {
        return true;
      }
      const oficina = row.original.reclutador?.Oficina;
      if (!oficina) return false;
      return filterValue.includes(oficina);
    },
    enableGlobalFilter: true,
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      return <ActionsRecruitment row={row} />;
    },
  },
];
