"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronDown, ChevronDownIcon, ChevronUp, SortAsc } from "lucide-react";
import { ChangeDateComponent } from "../../list/reclutamiento/components/AsignacionDatePickerComponent";
import { RecruiterDropDown } from "../../list/reclutamiento/components/RecruiterDropdown";
import { CommentSheet } from "../../list/reclutamiento/components/CommentSheet";
import { ActionsRecruitment } from "../../list/reclutamiento/components/ActionsRecruitment";
import { Prisma } from "@prisma/client";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { differenceInDays, format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { DocumentsSection } from "./DocumentsSection";
import { CandidatoContratadoDrawer } from "./CandidatoContratadoDrawer";
import { CandidatesTableSheet } from "../../list/reclutamiento/components/CandidatesTableSheet";
import { calculateDaysFromAssignment } from "./kanbanReclutadorBoard";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { updateVacancy } from "@/actions/vacantes/actions";
import { toast } from "sonner";
import { ToastCustomMessage } from "@/components/ToastCustomMessage";

// Componente para manejar el tiempo transcurrido con calendario
const TiempoTranscurridoCell = ({ row }: { row: any }) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [days, setDays] = useState<number | undefined>(
    row.original.tiempoTranscurrido
      ? row.original.tiempoTranscurrido
      : calculateDaysFromAssignment(row.original.fechaAsignacion)
  );
  const fechaAsignacion = row.original.fechaAsignacion;

  const handleDateChange = async (date: Date) => {
    if (date) {
      const days = differenceInDays(date, fechaAsignacion);
      setDays(days);
      const { message, ok } = await updateVacancy({
        id: row.original.id,
        tiempoTranscurrido: days,
      });
      if (!ok) {
        toast.custom((t) => (
          <ToastCustomMessage
            message={message || "Error al actualizar el tiempo transcurrido"}
            title="Error al actualizar el tiempo transcurrido"
            type="success"
            onClick={() => {
              toast.dismiss(t);
            }}
          />
        ));
        return;
      }
      toast.custom((t) => (
        <ToastCustomMessage
          message={message || "Operacion realizada correctamente"}
          title="Tiempo transcurrido actualizado"
          type="success"
          onClick={() => {
            toast.dismiss(t);
          }}
        />
      ));
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="w-48 justify-between font-normal"
          >
            {days} días
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            onSelect={(date) => {
              if (date) {
                handleDateChange(date);
              }
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export type VacancyWithRelations = Prisma.VacancyGetPayload<{
  include: {
    InputChecklist: {
      include: {
        InputChecklistFeedback: {
          include: {
            candidate: true;
          };
        };
      };
    };
    reclutador: true;
    cliente: true;
    candidatoContratado: {
      include: {
        cv: true;
        vacanciesContratado: true;
      };
    };
    ternaFinal: {
      include: {
        cv: true;
        vacanciesContratado: true;
      };
    };
    files: true;
    Comments: {
      include: {
        author: true;
      };
    };
  };
}>;

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
export const reclutadorColumns: ColumnDef<VacancyWithRelations>[] = [
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
    id: "reclutador",
    accessorKey: "reclutador",
    header: ({ column }) => (
      <SortableHeader column={column} title="Reclutador" />
    ),
    filterFn: (row, id, value) => {
      if (!value || !Array.isArray(value) || value.length === 0) {
        return true;
      }
      const cellValue = row.getValue(id);
      return value.includes(cellValue);
    },
    cell: ({ row }) => {
      return <RecruiterDropDown row={row} />;
    },
    accessorFn: (row) => row.reclutador.id,
  },
  {
    id: "cliente",
    accessorKey: "cliente",
    header: ({ column }) => <SortableHeader column={column} title="Cliente" />,
    cell: ({ row }) => {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" className="w-full">
              {row.original.cliente.cuenta}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Cliente</p>
          </TooltipContent>
        </Tooltip>
      );
    },
    accessorFn: (row) => row.cliente.cuenta,
  },
  {
    accessorKey: "posicion",
    header: ({ column }) => <SortableHeader column={column} title="Posicion" />,
    cell: ({ row }) => {
      //return <PosicionPopOver row={row} />;
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button className="flex items-center gap-2" variant="outline">
              <div className="max-w-[90px] truncate">
                {row.original.posicion}
              </div>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{row.original.posicion}</p>
          </TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    id: "estado",
    accessorKey: "estado",
    header: ({ column }) => <SortableHeader column={column} title="Estado" />,
    filterFn: (row, id, value) => {
      if (!value || !Array.isArray(value) || value.length === 0) {
        return true;
      }
      const cellValue = row.getValue(id);
      return value.includes(cellValue);
    },
    cell: ({ row }) => {
      //return <StatusDropdown row={row} />;
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" className="w-full">
              {row.original.estado}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Estado de la vacante</p>
          </TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    id: "comentarios",
    accessorKey: "comentarios",
    header: "Comentarios",
    cell: ({ row }) => (
      <CommentSheet
        vacancyId={row.original.id}
        vacancyOwnerId={row.original.reclutador.id}
      />
    ),
  },
  {
    id: "asignacion",
    header: "Asignacion",
    accessorKey: "fechaAsignacion",
    cell: ({ row }) => {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" className="w-full">
              {row.original.fechaAsignacion
                ? format(row.original.fechaAsignacion, "EEE d/M/yy", {
                    locale: es,
                  })
                : "N/A"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Fecha Asignacion</p>
          </TooltipContent>
        </Tooltip>
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
    id: "fechaEntrega",
    accessorKey: "fechaEntrega",
    header: ({ column }) => (
      <SortableHeader column={column} title="Fecha Entrega" />
    ),
    cell: ({ row }) => {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" className="w-full">
              {row.original.fechaEntrega
                ? format(row.original.fechaEntrega, "EEE d/M/yy", {
                    locale: es,
                  })
                : "N/A"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Fecha Entrega</p>
          </TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    id: "tiempoTranscurrido",
    header: ({ column }) => (
      <SortableHeader column={column} title="Tiempo transcurrido" />
    ),
    cell: ({ row }) => <TiempoTranscurridoCell row={row} />,
  },
  {
    id: "prioridad",
    accessorKey: "prioridad",
    header: ({ column }) => (
      <SortableHeader column={column} title="Prioridad" />
    ),
    cell: ({ row }) => {
      return (
        <Badge variant="outline" className="gap-1.5">
          {row.original.prioridad === "Alta" ? (
            <span
              className="size-1.5 rounded-full bg-emerald-500"
              aria-hidden="true"
            ></span>
          ) : row.original.prioridad === "Baja" ? (
            <span
              className="size-1.5 rounded-full bg-red-500"
              aria-hidden="true"
            ></span>
          ) : (
            <span
              className="size-1.5 rounded-full bg-yellow-500"
              aria-hidden="true"
            ></span>
          )}
          {row.original.prioridad}
        </Badge>
      );
    },
  },
  {
    id: "tipo",
    accessorKey: "tipo",
    header: ({ column }) => <SortableHeader column={column} title="Tipo" />,
    cell: ({ row }) => {
      //return <TypeDropdown row={row} />;
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {/* <Button variant="outline" className="w-full">
              {row.original.tipo}
            </Button> */}
            <Badge variant="outline" className="gap-1.5">
              {row.original.tipo === "Nueva" ? (
                <span
                  className="size-1.5 rounded-full bg-emerald-500"
                  aria-hidden="true"
                ></span>
              ) : row.original.tipo === "Recompra" ? (
                <span
                  className="size-1.5 rounded-full bg-blue-500"
                  aria-hidden="true"
                ></span>
              ) : (
                <span
                  className="size-1.5 rounded-full bg-red-500"
                  aria-hidden="true"
                ></span>
              )}
              {row.original.tipo}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Tipo de vacante</p>
          </TooltipContent>
        </Tooltip>
      );
    },
    accessorFn: (row) => row.tipo,
  },
  {
    accessorKey: "fechaEntregaTerna",
    header: ({ column }) => (
      <SortableHeader column={column} title="Fecha Terna" />
    ),
    cell: ({ row }) => {
      return (
        <ChangeDateComponent
          fecha={row.original.fechaEntregaTerna}
          onFechaChange={(nuevaFecha) => {
            // Aquí implementarías la lógica para actualizar la fecha en tu fuente de datos
            console.log("Fecha actualizada:", nuevaFecha);
          }}
        />
      );
    },
  },
  {
    accessorKey: "fechaOferta",
    header: ({ column }) => (
      <SortableHeader column={column} title="Fecha oferta" />
    ),
    cell: ({ row }) => {
      return (
        <ChangeDateComponent
          fecha={row.original.fechaOferta}
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
    header: "Contratado",
    cell: ({ row }) => (
      <div className="flex items-center justify-center w-full">
        <CandidatoContratadoDrawer
          candidatoContratado={row.original.candidatoContratado!}
        />
      </div>
    ),
  },
  {
    accessorKey: "salario",
    header: ({ column }) => <SortableHeader column={column} title="Salario" />,
    cell: ({ row }) => {
      const salario = row.original.salario;
      return (
        <div className="flex items-center justify-center">
          {salario ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <span className="max-w-[100px] truncate">{salario}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="max-w-[250px] z-[9999999] py-3 shadow-none"
                side="top"
              >
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-[15px] font-medium">
                      Salario de la vacante
                    </p>
                    <p className="text-muted-foreground text-sm">{salario}</p>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <span>N/A</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "fechaComision",
    header: ({ column }) => (
      <SortableHeader column={column} title="Fecha comision" />
    ),
    cell: ({ row }) => {
      return (
        <ChangeDateComponent
          fecha={row.original.fechaComision}
          onFechaChange={(nuevaFecha) => {
            // Aquí implementarías la lógica para actualizar la fecha en tu fuente de datos
            console.log("Fecha actualizada:", nuevaFecha);
          }}
        />
      );
    },
  },
  {
    accessorKey: "files",
    header: "Documentos",
    cell: ({ row }) => (
      <div className="w-full flex items-center justify-center">
        <DocumentsSection vacante={row.original} />
      </div>
    ),
  },
  {
    accessorKey: "ternaFinal",
    header: "Candidatos",
    cell: ({ row }) => (
      <CandidatesTableSheet
        vacancyId={row.original.id}
        ternaFinal={row.original.ternaFinal}
        vacancy={row.original}
      />
    ),
  },
  // {
  //   accessorKey: "duracionTotal",

  //   header: ({ column }) => (
  //     <SortableHeader column={column} title="Duración Total" />
  //   ),
  //   cell: ({ row }) => {
  //     const fechaAsignacion = row.original.fechaAsignacion;
  //     const estado = row.original.estado;
  //     const fechaOferta = row.original.fechaOferta;

  //     if (!fechaAsignacion) {
  //       return (
  //         <div className="flex items-center justify-center">
  //           <Button variant="outline" className="w-full">
  //             <p>
  //               <span className="text-red-500">N/A</span>
  //             </p>
  //           </Button>
  //         </div>
  //       );
  //     }

  //     // Calcular la fecha final según el estado
  //     let fechaFinal: Date;
  //     if (estado === "Placement" && fechaOferta) {
  //       fechaFinal = fechaOferta;
  //     } else {
  //       fechaFinal = new Date();
  //     }

  //     // Calcular la diferencia en días
  //     const tiempoTranscurrido = Math.floor(
  //       (fechaFinal.getTime() - fechaAsignacion.getTime()) /
  //         (1000 * 60 * 60 * 24)
  //     );

  //     return (
  //       <div className="flex items-center justify-center">
  //         <Button variant="outline" className="w-full">
  //           <p>
  //             <span>{tiempoTranscurrido} días</span>
  //           </p>
  //         </Button>
  //       </div>
  //     );
  //   },
  // },
  {
    id: "oficina",
    accessorKey: "oficina",
    header: ({ column }) => <SortableHeader column={column} title="Oficina" />,
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-center">
          <Button variant="outline" className="w-full">
            <p>
              {oficinaMap[row.original.reclutador?.Oficina] || "Sin oficina"}
            </p>
          </Button>
        </div>
      );
    },
    accessorFn: (row) => row.reclutador?.Oficina,
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      return <ActionsRecruitment row={row} />;
    },
    enableSorting: false,
    enableHiding: false,
  },
];

const oficinaMap = {
  Oficina1: "Oficina 1",
  Oficina2: "Oficina 2",
};
