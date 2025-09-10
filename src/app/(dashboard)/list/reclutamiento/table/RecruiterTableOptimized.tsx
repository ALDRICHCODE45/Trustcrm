"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  VisibilityState,
  FilterFn,
  Row,
  ColumnOrderState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  FolderSearch,
  Layers,
  Loader2,
  RefreshCw,
  Download,
  SlidersHorizontal,
  X,
  SearchIcon,
  Maximize2,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "../../../../../components/DateRangePicker";
import {
  clientesData,
  Oficina,
  Role,
  UsersData,
  Vacante,
} from "../../../../../lib/data";
import { toast } from "sonner";
import CreateVacanteForm from "../components/CreateVacanteForm";
import { Client, User, VacancyTipo } from "@prisma/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Router } from "next/router";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import QuickStatsDialog from "@/app/(dashboard)/reclutador/components/QuickStatsDialog";
import { ToastCustomMessage } from "@/components/ToastCustomMessage";

// Función de filtro personalizada para rangos de fechas
const dateRangeFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
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
};

// Función de filtro personalizada para múltiples estados
const multiStatusFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
  if (!filterValue || !Array.isArray(filterValue) || filterValue.length === 0) {
    return true;
  }

  const cellValue = row.getValue(columnId);
  if (!cellValue) return false;

  return filterValue.includes(cellValue);
};

// Tipos
export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  defaultPageSize?: number;
  filterPlaceholder?: string;
  reclutadores: User[];
  clientes: Client[];
  user_logged: {
    id: string;
    name: string;
    role: string;
  };
}

// Componente de filtros integrado
interface TableFiltersProps<TData, TValue> {
  table: ReturnType<typeof useReactTable<TData>>;
  filterPlaceholder?: string;
  onGlobalFilterChange?: (value: string) => void;
  currentStatus: string[];
  setCurrentStatus: (newStatus: string[]) => void;
  currentClient: string;
  setCurrentClient: (newClient: string) => void;
  currentRecruiter: string[];
  setCurrentRecruiter: (newRecruiter: string[]) => void;
  currentTipo: string;
  setCurrentTipo: (newTipo: string) => void;
  dateRange: DateRange | undefined;
  setDateRange: (newRange: DateRange | undefined) => void;
  currentOficina: Oficina | "all";
  setCurrentOficina: (newOficina: Oficina | "all") => void;
  reclutadores: User[];
  clientes: Client[];
  isCompact?: boolean;
  showTopActions: boolean;
  setShowTopActions: (show: boolean) => void;
}

function TableFilters<TData, TValue>({
  table,
  filterPlaceholder = "Filtrar...",
  onGlobalFilterChange,
  currentStatus,
  setCurrentStatus,
  currentClient,
  setCurrentClient,
  currentRecruiter,
  setCurrentRecruiter,
  currentTipo,
  setCurrentTipo,
  dateRange,
  setDateRange,
  currentOficina,
  setCurrentOficina,
  reclutadores,
  clientes,
  isCompact = false,
  showTopActions,
  setShowTopActions,
}: TableFiltersProps<TData, TValue>) {
  const [isExporting, setIsExporting] = useState(false);

  const statusOptions = [
    { value: "QuickMeeting", label: "Quick Meeting" },
    { value: "Hunting", label: "Hunting" },
    { value: "Cancelada", label: "Cancelada" },
    { value: "Entrevistas", label: "Entrevistas" },
    { value: "Perdida", label: "Perdida" },
    { value: "Placement", label: "Placement" },
    { value: "PrePlacement", label: "Pre Placement" },
  ];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Lógica de exportación
      toast.success("Exportación completada");
    } catch (error) {
      toast.error("Error al exportar los datos");
    } finally {
      setIsExporting(false);
    }
  };

  const resetFilters = useCallback(() => {
    setCurrentStatus([]);
    setCurrentClient("all");
    setCurrentRecruiter([]);
    setCurrentTipo("all");
    setDateRange(undefined);
    setCurrentOficina("all");
    table.getColumn("estado")?.setFilterValue(undefined);
    table.getColumn("cliente")?.setFilterValue(undefined);
    table.getColumn("reclutador")?.setFilterValue(undefined);
    table.getColumn("tipo")?.setFilterValue(undefined);
    table.getColumn("asignacion")?.setFilterValue(undefined);
    table.getColumn("oficina")?.setFilterValue(undefined);
    onGlobalFilterChange?.("");
  }, [
    setCurrentStatus,
    setCurrentClient,
    setCurrentRecruiter,
    setCurrentTipo,
    setDateRange,
    setCurrentOficina,
    table,
    onGlobalFilterChange,
  ]);

  const handleDateRangeChange = useCallback(
    (range: DateRange | undefined) => {
      setDateRange(range);
      if (!range || (!range.from && !range.to)) {
        table.getColumn("asignacion")?.setFilterValue(undefined);
        return;
      }
      table.getColumn("asignacion")?.setFilterValue(range);
      table.setPageIndex(0);
    },
    [setDateRange, table]
  );

  const clearFilters = [
    {
      condition: currentOficina !== "all",
      label: `Oficina: ${currentOficina}`,
      clear: () => {
        setCurrentOficina("all");
        table.getColumn("oficina")?.setFilterValue(undefined);
      },
    },
    {
      condition: currentStatus.length > 0,
      label: `Estados: ${currentStatus.length} seleccionado${
        currentStatus.length > 1 ? "s" : ""
      }`,
      clear: () => {
        setCurrentStatus([]);
        table.getColumn("estado")?.setFilterValue(undefined);
      },
    },
    {
      condition: currentClient !== "all",
      label: `Cliente: ${currentClient}`,
      clear: () => {
        setCurrentClient("all");
        table.getColumn("cliente")?.setFilterValue(undefined);
      },
    },
    {
      condition: currentRecruiter.length > 0,
      label: `Reclutadores: ${currentRecruiter.length} seleccionado${
        currentRecruiter.length > 1 ? "s" : ""
      }`,
      clear: () => {
        setCurrentRecruiter([]);
        table.getColumn("reclutador")?.setFilterValue(undefined);
      },
    },
    {
      condition: currentTipo !== "all",
      label: `Tipo: ${currentTipo}`,
      clear: () => {
        setCurrentTipo("all");
        table.getColumn("tipo")?.setFilterValue(undefined);
      },
    },
    {
      condition: dateRange && (dateRange.from || dateRange.to),
      label: `Fecha: ${
        dateRange?.from
          ? format(dateRange?.from, "EEE d/M/yy", { locale: es })
          : ""
      } - ${
        dateRange?.to
          ? format(dateRange?.to, "EEE d/M/yy", { locale: es })
          : "ahora"
      }`,
      clear: () => {
        setDateRange(undefined);
        table.getColumn("asignacion")?.setFilterValue(undefined);
      },
    },
  ];

  return (
    <Card
      className={`mb-6 border-0 shadow-md overflow-hidden transition-all duration-300 ${
        isCompact ? "shadow-sm" : ""
      }`}
    >
      <CardHeader
        className={`${
          isCompact ? "pb-1 pt-3" : "pb-2"
        } flex flex-row items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800`}
      >
        <div className="flex items-center gap-2">
          <Filter
            className={`${isCompact ? "h-4 w-4" : "h-5 w-5"} text-primary`}
          />
          <h3 className={`${isCompact ? "text-base" : "text-lg"} font-medium`}>
            {isCompact ? "Filtros" : "Filtros"}
          </h3>
          <Badge
            variant="outline"
            className={`ml-2 ${isCompact ? "text-xs px-2 py-0" : ""}`}
          >
            {table.getFilteredRowModel().rows.length} resultados
          </Badge>
          {isCompact && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTopActions(true)}
              className="h-6 px-2 text-xs ml-2 hover:bg-primary/10"
            >
              <Maximize2 className="h-3 w-3 mr-1" />
              Expandir
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {!isCompact && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="h-8 px-3 flex items-center gap-1"
            >
              <RefreshCw />
              <span>Limpiar</span>
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={`${isCompact ? "h-7 px-2" : "h-8 px-3"}`}
              >
                <SlidersHorizontal
                  size={isCompact ? 14 : 16}
                  className="mr-2"
                />
                {isCompact ? "" : "Acciones"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isCompact && (
                <>
                  <DropdownMenuCheckboxItem
                    className="flex items-center gap-2"
                    onClick={resetFilters}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Limpiar filtros
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuCheckboxItem
                className="flex items-center gap-2"
                onClick={handleExport}
                disabled={isExporting}
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Exportar a CSV
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <ColumnSelector table={table} />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent
        className={`${isCompact ? "pt-2 pb-2 px-4" : "pt-4 pb-3 px-6"}`}
      >
        <div
          className={`grid gap-${isCompact ? "2" : "4"} ${
            isCompact
              ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 xl:grid-cols-8"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
          }`}
        >
          {/* Filtro de Estado - Ahora con múltiple selección */}
          <div className={`space-y-${isCompact ? "1" : "2"}`}>
            <Label
              htmlFor="status-filter"
              className={`text-xs font-medium ${isCompact ? "sr-only" : ""}`}
            >
              Estados
            </Label>
            <Select
              value=""
              onValueChange={(value) => {
                if (!currentStatus.includes(value)) {
                  // Solo agregar nuevo estado si no está ya seleccionado
                  const newStatus = [...currentStatus, value];
                  setCurrentStatus(newStatus);
                  table.getColumn("estado")?.setFilterValue(newStatus);
                  table.setPageIndex(0);
                }
              }}
            >
              <SelectTrigger
                className={`${isCompact ? "h-8 text-xs" : "h-9 text-sm"}`}
              >
                <SelectValue
                  placeholder={isCompact ? "Estados" : "Seleccionar estados"}
                >
                  {currentStatus.length === 0
                    ? isCompact
                      ? "Estados"
                      : "Seleccionar estados"
                    : currentStatus.length === 1
                    ? statusOptions.find((s) => s.value === currentStatus[0])
                        ?.label
                    : `${currentStatus.length} estados`}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem
                    key={status.value}
                    value={status.value}
                    disabled={currentStatus.includes(status.value)}
                  >
                    {status.label}
                  </SelectItem>
                ))}
                {statusOptions.length === 0 && (
                  <SelectItem value="" disabled>
                    No hay estados disponibles
                  </SelectItem>
                )}
              </SelectContent>
            </Select>

            {currentStatus.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {currentStatus.map((statusValue) => {
                  const status = statusOptions.find(
                    (s) => s.value === statusValue
                  );
                  return (
                    <Badge
                      key={statusValue}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {status?.label || "Estado desconocido"}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 hover:bg-transparent"
                        onClick={() => {
                          const newStatus = currentStatus.filter(
                            (s) => s !== statusValue
                          );
                          setCurrentStatus(newStatus);
                          if (newStatus.length === 0) {
                            table
                              .getColumn("estado")
                              ?.setFilterValue(undefined);
                          } else {
                            table
                              .getColumn("estado")
                              ?.setFilterValue(newStatus);
                          }
                          table.setPageIndex(0);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          {/* Filtro de Oficina */}
          <div className={`space-y-${isCompact ? "1" : "2"}`}>
            <Label
              htmlFor="oficina-filter"
              className={`text-xs font-medium ${isCompact ? "sr-only" : ""}`}
            >
              Oficina
            </Label>
            <Select value={currentOficina} onValueChange={setCurrentOficina}>
              <SelectTrigger
                className={`${isCompact ? "h-8 text-xs" : "h-9 text-sm"}`}
              >
                <SelectValue
                  placeholder={isCompact ? "Oficina" : "Todas las oficinas"}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Todas las oficinas</SelectItem>
                  <SelectItem value={Oficina.uno}>Oficina 1</SelectItem>
                  <SelectItem value={Oficina.dos}>Oficina 2</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro de Cliente */}
          <div className={`space-y-${isCompact ? "1" : "2"}`}>
            <Label
              htmlFor="client-filter"
              className={`text-xs font-medium ${isCompact ? "sr-only" : ""}`}
            >
              Cliente
            </Label>
            <Select value={currentClient} onValueChange={setCurrentClient}>
              <SelectTrigger
                className={`${isCompact ? "h-8 text-xs" : "h-9 text-sm"}`}
              >
                <SelectValue
                  placeholder={isCompact ? "Cliente" : "Todos los clientes"}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Todos los clientes</SelectItem>
                  {clientes
                    .filter((cliente) => cliente.cuenta)
                    .map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.cuenta!}>
                        {cliente.cuenta}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro de Reclutador - Ahora con múltiple selección */}
          <div className={`space-y-${isCompact ? "1" : "2"}`}>
            <Label
              htmlFor="recruiter-filter"
              className={`text-xs font-medium ${isCompact ? "sr-only" : ""}`}
            >
              Reclutadores
            </Label>
            <Select
              value=""
              onValueChange={(value) => {
                if (!currentRecruiter.includes(value)) {
                  // Solo agregar nuevo reclutador si no está ya seleccionado
                  const newRecruiter = [...currentRecruiter, value];
                  setCurrentRecruiter(newRecruiter);
                  table.getColumn("reclutador")?.setFilterValue(newRecruiter);
                  table.setPageIndex(0);
                }
              }}
            >
              <SelectTrigger
                className={`${isCompact ? "h-8 text-xs" : "h-9 text-sm"}`}
              >
                <SelectValue
                  placeholder={
                    isCompact ? "Reclutadores" : "Seleccionar reclutadores"
                  }
                >
                  {currentRecruiter.length === 0
                    ? isCompact
                      ? "Reclutadores"
                      : "Seleccionar reclutadores"
                    : currentRecruiter.length === 1
                    ? reclutadores
                        .find((r) => r.id === currentRecruiter[0])
                        ?.name?.split(" ")[0]
                    : `${currentRecruiter.length} reclutadores`}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {reclutadores.map((recruiter) => (
                  <SelectItem
                    key={recruiter.id}
                    value={recruiter.id}
                    disabled={currentRecruiter.includes(recruiter.id)}
                  >
                    {recruiter.name}
                  </SelectItem>
                ))}
                {reclutadores.length === 0 && (
                  <SelectItem value="" disabled>
                    No hay reclutadores disponibles
                  </SelectItem>
                )}
              </SelectContent>
            </Select>

            {currentRecruiter.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {currentRecruiter.map((recruiterId) => {
                  const recruiter = reclutadores.find(
                    (r) => r.id === recruiterId
                  );
                  return (
                    <Badge
                      key={recruiterId}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {recruiter?.name?.split(" ")[0] ||
                        "Reclutador desconocido"}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 hover:bg-transparent"
                        onClick={() => {
                          const newRecruiter = currentRecruiter.filter(
                            (r) => r !== recruiterId
                          );
                          setCurrentRecruiter(newRecruiter);
                          if (newRecruiter.length === 0) {
                            table
                              .getColumn("reclutador")
                              ?.setFilterValue(undefined);
                          } else {
                            table
                              .getColumn("reclutador")
                              ?.setFilterValue(newRecruiter);
                          }
                          table.setPageIndex(0);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          {/* Filtro de Tipo */}
          <div className={`space-y-${isCompact ? "1" : "2"}`}>
            <Label
              htmlFor="tipo-filter"
              className={`text-xs font-medium ${isCompact ? "sr-only" : ""}`}
            >
              Tipo
            </Label>
            <Select value={currentTipo} onValueChange={setCurrentTipo}>
              <SelectTrigger
                className={`${isCompact ? "h-8 text-xs" : "h-9 text-sm"}`}
              >
                <SelectValue
                  placeholder={isCompact ? "Tipo" : "Todos los tipos"}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value={VacancyTipo.Nueva}>Nueva</SelectItem>
                  <SelectItem value={VacancyTipo.Garantia}>Garantia</SelectItem>
                  <SelectItem value={VacancyTipo.Recompra}>Recompra</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro de Rango de Fechas */}
          <div className={`space-y-${isCompact ? "1" : "2"}`}>
            <Label
              htmlFor="date-range-filter"
              className={`text-xs font-medium ${isCompact ? "sr-only" : ""}`}
            >
              Fecha de Asignación
            </Label>
            <DateRangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              placeholder={isCompact ? "Fechas" : "Seleccionar fechas"}
              className={`${isCompact ? "h-8 text-xs" : "h-9 text-sm"}`}
            />
          </div>
        </div>

        {/* Indicadores de filtros activos */}
        {!isCompact && (
          <div className="flex flex-wrap gap-2 mt-4">
            {clearFilters.map((filter, index) =>
              filter.condition ? (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {filter.label}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={filter.clear}
                  />
                </Badge>
              ) : null
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Componente para el selector de columnas
interface ColumnSelectorProps<TData> {
  table: ReturnType<typeof useReactTable<TData>>;
}

function ColumnSelector<TData>({ table }: ColumnSelectorProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="default" className="w-full">
          <Layers size={16} className="mr-2" />
          Columnas visibles
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-h-[400px] overflow-y-scroll"
        onSelect={(e) => e.preventDefault()}
      >
        {table
          .getAllColumns()
          .filter((column) => column.getCanHide())
          .map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              className="capitalize"
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              {column.id}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Componente de paginación
interface PaginationProps<TData> {
  table: ReturnType<typeof useReactTable<TData>>;
  pageSize: number;
  onPageSizeChange: (value: string) => void;
}

function TablePagination<TData>({
  table,
  pageSize,
  onPageSizeChange,
}: PaginationProps<TData>) {
  const { pageIndex, pageSize: currentPageSize } = table.getState().pagination;
  const totalPages = table.getPageCount();
  const totalRows = table.getFilteredRowModel().rows.length;
  const selectedRows = table.getFilteredSelectedRowModel().rows.length;

  // Usar el pageSize actual de la tabla, no el prop
  const actualPageSize = currentPageSize;

  // Calcular la última página de forma segura
  const lastPageIndex = Math.max(0, totalPages - 1);

  // Calcular el rango de registros mostrados
  const startRecord = totalRows === 0 ? 0 : pageIndex * actualPageSize + 1;
  const endRecord = Math.min((pageIndex + 1) * actualPageSize, totalRows);

  return (
    <Card className="mt-4">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Información de paginación */}
          <div className="flex-1 text-sm text-muted-foreground">
            <div className="flex flex-col sm:flex-row gap-2">
              <span className="font-medium">
                Página {pageIndex + 1} de {totalPages || 1}
              </span>
              <span className="text-muted-foreground">
                (Mostrando {startRecord}-{endRecord} de {totalRows} registros)
              </span>
              {selectedRows > 0 && (
                <span className="text-muted-foreground">
                  • {selectedRows} filas seleccionadas
                </span>
              )}
            </div>
          </div>

          {/* Selector de filas por página y navegación */}
          <div className="flex items-center gap-4">
            {/* Selector de filas por página */}
            <div className="flex items-center gap-2">
              <Label htmlFor="page-size" className="text-sm">
                Filas por página:
              </Label>
              <Select
                value={actualPageSize.toString()}
                onValueChange={onPageSizeChange}
              >
                <SelectTrigger id="page-size" className="w-[80px]">
                  <SelectValue placeholder={actualPageSize.toString()} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Navegación de páginas */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                title="Primera página"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                title="Página anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Indicador de página actual */}
              <div className="flex items-center gap-1 px-2">
                <span className="text-sm font-medium">{pageIndex + 1}</span>
                <span className="text-sm text-muted-foreground">/</span>
                <span className="text-sm text-muted-foreground">
                  {totalPages || 1}
                </span>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                title="Página siguiente"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => table.setPageIndex(lastPageIndex)}
                disabled={!table.getCanNextPage() || totalPages <= 1}
                title="Última página"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente de la tabla con drag and drop
interface DataGridProps<TData, TValue> {
  table: ReturnType<typeof useReactTable<TData>>;
  columns: ColumnDef<TData, TValue>[];
}

function DataGrid<TData, TValue>({
  table,
  columns,
}: DataGridProps<TData, TValue>) {
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  useEffect(() => {
    setColumnOrder(table.getAllColumns().map((column) => column.id));
  }, [table]);

  // Columnas que no se pueden mover
  const nonDraggableColumns = useMemo(() => ["select", "actions"], []);

  const handleClearFilters = useCallback(() => {
    table.resetColumnFilters();
  }, [table]);

  return (
    <div className="rounded-md border shadow-sm dark:bg-[#0e0e0e] overflow-hidden">
      <Table className="downloadable-table">
        <TableHeader className="bg-gray-50 dark:bg-slate-900/50">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => {
                const isDraggable = !nonDraggableColumns.includes(header.id);
                return (
                  <TableHead
                    key={header.id}
                    className={`
                      font-medium text-xs uppercase py-3 transition-all duration-200
                      ${isDraggable ? "cursor-move" : ""}
                      ${
                        draggedColumn === header.id ? "opacity-50 scale-95" : ""
                      }
                      ${
                        dropTarget === header.id
                          ? "bg-primary/20 border-2 border-primary"
                          : ""
                      }
                      hover:bg-muted/70
                    `}
                    draggable={isDraggable}
                    onDragStart={
                      isDraggable
                        ? (e) => {
                            setDraggedColumn(header.id);
                            e.dataTransfer.setData("text/plain", header.id);
                            e.dataTransfer.effectAllowed = "move";
                          }
                        : undefined
                    }
                    onDragEnd={
                      isDraggable
                        ? () => {
                            setDraggedColumn(null);
                            setDropTarget(null);
                          }
                        : undefined
                    }
                    onDragOver={
                      isDraggable
                        ? (e) => {
                            e.preventDefault();
                            if (header.id !== draggedColumn) {
                              setDropTarget(header.id);
                            }
                          }
                        : undefined
                    }
                    onDragLeave={
                      isDraggable
                        ? (e) => {
                            e.preventDefault();
                            if (header.id !== draggedColumn) {
                              setDropTarget(null);
                            }
                          }
                        : undefined
                    }
                    onDrop={
                      isDraggable
                        ? (e) => {
                            e.preventDefault();
                            setDraggedColumn(null);
                            setDropTarget(null);
                            const draggedColumnId =
                              e.dataTransfer.getData("text/plain");
                            const dropColumnId = header.id;
                            if (draggedColumnId === dropColumnId) return;
                            const newColumnOrder = [...columnOrder];
                            const draggedIndex =
                              newColumnOrder.indexOf(draggedColumnId);
                            const dropIndex =
                              newColumnOrder.indexOf(dropColumnId);
                            newColumnOrder.splice(draggedIndex, 1);
                            newColumnOrder.splice(
                              dropIndex,
                              0,
                              draggedColumnId
                            );
                            setColumnOrder(newColumnOrder);
                            table.setColumnOrder(newColumnOrder);
                          }
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-2">
                      {isDraggable && (
                        <span className="text-muted-foreground">⋮⋮</span>
                      )}
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className={`
                  hover:bg-gray-50 dark:hover:bg-slate-900/50 transition-colors group
                  ${hoveredRow === row.id ? "bg-muted/30" : ""}
                  ${row.getIsSelected() ? "bg-primary/10" : ""}
                `}
                onMouseEnter={() => setHoveredRow(row.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={`
                      py-3 group-hover:bg-muted/30 transition-colors
                      ${hoveredRow === row.id ? "bg-muted/40" : ""}
                    `}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-32 text-center">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <FolderSearch className="h-8 w-8 mb-2 opacity-40" />
                  <h3 className="font-medium">No se encontraron resultados</h3>
                  <p className="text-sm">
                    Intente con diferentes criterios de búsqueda
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                    className="mt-2"
                  >
                    Limpiar filtros
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// Componente principal optimizado
export function RecruiterTable<TData, TValue>({
  columns,
  data,
  defaultPageSize = 10,
  filterPlaceholder = "Buscar vacantes...",
  reclutadores,
  clientes,
  user_logged,
}: DataTableProps<TData, TValue>) {
  // Estados
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pageSize, setPageSize] = useState<number>(defaultPageSize);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [currentStatus, setCurrentStatus] = useState<string[]>([]);
  const [currentRecruiter, setCurrentRecruiter] = useState<string[]>([]);
  const [currentClient, setCurrentClient] = useState("all");
  const [currentTipo, setCurrentTipo] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [currentOficina, setCurrentOficina] = useState<Oficina | "all">("all");
  const [tableData, setTableData] = useState<TData[]>(data);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [showTopActions, setShowTopActions] = useState(true);

  // Memoizar los datos de la tabla para evitar re-renderizaciones innecesarias
  const memoizedData = useMemo(() => tableData, [tableData]);

  const [pagination, setPagination] = useState({
    pageIndex: currentPage,
    pageSize: defaultPageSize,
  });

  // Configuración de la tabla
  const table = useReactTable({
    data: memoizedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onColumnOrderChange: setColumnOrder,
    onPaginationChange: setPagination,
    filterFns: {
      filterDateRange: dateRangeFilterFn,
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination,
      columnOrder,
    },
  });
  const router = useRouter();

  // Efecto para actualizar los datos cuando cambia la prop data
  useEffect(() => {
    setTableData(data);
    // Resetear la página a la primera cuando se actualizan los datos
    table.setPageIndex(0);
  }, [data, table]);

  // Función para actualizar los datos
  const refreshData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      router.refresh();
      toast.custom((t) => (
        <ToastCustomMessage
          title="Datos actualizados correctamente"
          message="Los datos se han actualizado correctamente"
          type="success"
          onClick={() => toast.dismiss(t)}
        />
      ));
    } catch (error) {
      console.error("Error al actualizar los datos:", error);
      toast.error("Error al actualizar los datos");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Memoize handlers to prevent unnecessary re-renders
  const handlePageSizeChange = useCallback(
    (value: string) => {
      const newSize = parseInt(value, 10);
      setPageSize(newSize);
      table.setPageSize(newSize);
    },
    [table]
  );

  const handleGlobalFilterChange = useCallback(
    (value: string) => {
      setGlobalFilter(value);
      table.setPageIndex(0);
    },
    [table]
  );

  const handleStatusChange = useCallback(
    (value: string[]) => {
      setCurrentStatus(value);
      if (value.length === 0) {
        table.getColumn("estado")?.setFilterValue(undefined);
      } else {
        table.getColumn("estado")?.setFilterValue(value);
      }
      table.setPageIndex(0);
    },
    [table]
  );

  const handleClientChange = useCallback(
    (value: string) => {
      if (value === "all") {
        table.getColumn("cliente")?.setFilterValue(undefined);
        setCurrentClient("all");
        return;
      }
      setCurrentClient(value);
      table.getColumn("cliente")?.setFilterValue(value);
      table.setPageIndex(0);
    },
    [table]
  );

  const handleTipoChange = useCallback(
    (value: string) => {
      if (value === "all") {
        table.getColumn("tipo")?.setFilterValue(undefined);
        setCurrentTipo("all");
        return;
      }
      setCurrentTipo(value);
      table.getColumn("tipo")?.setFilterValue(value);
      table.setPageIndex(0);
    },
    [table]
  );

  const handleOficinaChange = useCallback(
    (value: string) => {
      if (value === "all") {
        table.getColumn("oficina")?.setFilterValue(undefined);
        setCurrentOficina("all");
        return;
      }

      setCurrentOficina(value as Oficina);

      table.getColumn("oficina")?.setFilterValue(value as Oficina);
      table.setPageIndex(0);
    },
    [table]
  );

  const handleDateRangeChange = useCallback(
    (range: DateRange | undefined) => {
      setDateRange(range);
      if (!range || (!range.from && !range.to)) {
        table.getColumn("asignacion")?.setFilterValue(undefined);
        return;
      }
      table.getColumn("asignacion")?.setFilterValue(range);
      table.setPageIndex(0);
    },
    [table]
  );

  return (
    <div className="w-full max-w-[93vw] space-y-4">
      {/* Panel superior con acciones principales */}
      {showTopActions && (
        <Card className="border-0 shadow-sm ">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              {/* Sección izquierda - Acciones y búsqueda */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={refreshData}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 hover:bg-primary/5 transition-colors"
                  >
                    {isRefreshing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    {isRefreshing ? "Actualizando..." : "Actualizar"}
                  </Button>

                  <div className="hidden sm:block h-6 w-px bg-border" />

                  <Badge
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    <span className="text-xs font-medium">
                      {table.getFilteredRowModel().rows.length} vacantes
                    </span>
                  </Badge>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <SearchIcon className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre de posición..."
                    value={
                      (table
                        .getColumn("posicion")
                        ?.getFilterValue() as string) ?? ""
                    }
                    onChange={(event) =>
                      table
                        .getColumn("posicion")
                        ?.setFilterValue(event.target.value)
                    }
                    className="w-full sm:w-80 "
                  />
                </div>
              </div>

              {/* Sección derecha - Acciones principales */}
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTopActions(false)}
                  className="h-8 px-2 text-xs hover:bg-muted/50"
                  title="Contraer panel"
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="h-6 w-px bg-border" />
                <QuickStatsDialog />
                <CreateVacanteForm
                  reclutadores={reclutadores}
                  clientes={clientes}
                  user_logged={user_logged}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <TableFilters
        reclutadores={reclutadores}
        clientes={clientes}
        table={table}
        filterPlaceholder={filterPlaceholder}
        onGlobalFilterChange={handleGlobalFilterChange}
        currentStatus={currentStatus}
        setCurrentStatus={handleStatusChange}
        currentClient={currentClient}
        setCurrentClient={handleClientChange}
        currentRecruiter={currentRecruiter}
        setCurrentRecruiter={setCurrentRecruiter}
        currentTipo={currentTipo}
        setCurrentTipo={handleTipoChange}
        dateRange={dateRange}
        setDateRange={handleDateRangeChange}
        currentOficina={currentOficina}
        setCurrentOficina={handleOficinaChange}
        isCompact={!showTopActions}
        showTopActions={showTopActions}
        setShowTopActions={setShowTopActions}
      />

      {/* Componente de tabla optimizado */}
      <DataGrid table={table} columns={columns} />

      {/* Componente de paginación optimizado */}
      <TablePagination
        table={table}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}
