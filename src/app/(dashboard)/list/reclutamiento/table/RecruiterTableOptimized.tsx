"use client";
import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useTransition,
} from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  FilterFn,
  ColumnOrderState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
  Users,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "../../../../../components/DateRangePicker";
import { toast } from "sonner";
import CreateVacanteForm from "../components/CreateVacanteForm";
import { Client, Oficina, User, VacancyTipo } from "@prisma/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import QuickStatsDialog from "@/app/(dashboard)/reclutador/components/QuickStatsDialog";
import { ToastCustomMessage } from "@/components/ToastCustomMessage";
import { cn } from "@/core/lib/utils";

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
  totalCount?: number;
  initialPageIndex?: number;
}

// Componente de filtros integrado
interface TableFiltersProps<TData, TValue> {
  table: ReturnType<typeof useReactTable<TData>>;
  filterPlaceholder?: string;
  onGlobalFilterChange?: (value: string) => void;
  currentStatus: string[];
  setCurrentStatus: (newStatus: string[]) => void;
  currentClient: string[];
  setCurrentClient: (newClient: string[]) => void;
  currentRecruiter: string[];
  setCurrentRecruiter: (newRecruiter: string[]) => void;
  currentTipo: string[];
  setCurrentTipo: (newTipo: string[]) => void;
  dateRange: DateRange | undefined;
  setDateRange: (newRange: DateRange | undefined) => void;
  currentOficina: Oficina[];
  setCurrentOficina: (newOficina: Oficina[]) => void;
  reclutadores: User[];
  clientes: Client[];
  isCompact?: boolean;
  showTopActions: boolean;
  setShowTopActions: (show: boolean) => void;
}

function TableFilters<TData, TValue>({
  table,
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
  setShowTopActions,
}: TableFiltersProps<TData, TValue>) {
  const [isExporting, setIsExporting] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Helper para actualizar URL con filtros
  const updateFilters = useCallback(
    (updates: Record<string, string | string[] | undefined>) => {
      const params = new URLSearchParams(searchParams?.toString());
      params.set("page", "0"); // Reset a la primera página

      Object.entries(updates).forEach(([key, value]) => {
        if (
          value === undefined ||
          value === "" ||
          (Array.isArray(value) && value.length === 0)
        ) {
          params.delete(key);
        } else if (Array.isArray(value)) {
          params.set(key, value.join(","));
        } else {
          params.set(key, value);
        }
      });

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [pathname, router, searchParams, startTransition]
  );

  const statusOptions = [
    { value: "QuickMeeting", label: "Quick Meeting" },
    { value: "Hunting", label: "Hunting" },
    { value: "Cancelada", label: "Cancelada" },
    { value: "Entrevistas", label: "Follow Up" },
    { value: "Perdida", label: "Perdida" },
    { value: "Placement", label: "Placement" },
    { value: "PrePlacement", label: "Pre Placement" },
    { value: "StandBy", label: "Stand By" },
  ];

  const oficinaOptions = [
    { value: Oficina.Oficina1, label: "Oficina 1" },
    { value: Oficina.Oficina2, label: "Oficina 2" },
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

  // Función específica para manejar cambios en reclutadores
  const handleReclutadorToggle = (reclutadorId: string, checked: boolean) => {
    const newRecruiter = checked
      ? [...currentRecruiter, reclutadorId]
      : currentRecruiter.filter((id) => id !== reclutadorId);

    setCurrentRecruiter(newRecruiter);
    updateFilters({ reclutadores: newRecruiter });
  };

  const handleClientToggle = (clientId: string, checked: boolean) => {
    const newClient = checked
      ? [...currentClient, clientId]
      : currentClient.filter((id) => id !== clientId);

    setCurrentClient(newClient);
    updateFilters({ clientes: newClient });
  };

  // Función específica para manejar cambios en estados
  const handleStatusToggle = (statusValue: string, checked: boolean) => {
    const newStatus = checked
      ? [...currentStatus, statusValue]
      : currentStatus.filter((s) => s !== statusValue);

    setCurrentStatus(newStatus);
    updateFilters({ estados: newStatus });
  };

  // Función específica para manejar cambios en oficinas
  const handleOficinaToggle = (oficinaValue: Oficina, checked: boolean) => {
    const newOficina = checked
      ? [...currentOficina, oficinaValue]
      : currentOficina.filter((o) => o !== oficinaValue);

    setCurrentOficina(newOficina);
    updateFilters({ oficinas: newOficina });
  };

  // Función específica para manejar cambios en tipos
  const handleTipoToggle = (tipoValue: string, checked: boolean) => {
    const newTipo = checked
      ? [...currentTipo, tipoValue]
      : currentTipo.filter((t) => t !== tipoValue);

    setCurrentTipo(newTipo);
    updateFilters({ tipos: newTipo });
  };

  // Hidratar estados de UI desde la URL al montar o cuando cambien los params
  useEffect(() => {
    const getArray = (key: string): string[] => {
      const v = searchParams?.get(key);
      return v ? v.split(",").filter(Boolean) : [];
    };

    const estadosParam = getArray("estados");
    const clientesParam = getArray("clientes");
    const reclutadoresParam = getArray("reclutadores");
    const tiposParam = getArray("tipos");
    const oficinasParam = getArray("oficinas");
    const dateFromParam = searchParams?.get("dateFrom");
    const dateToParam = searchParams?.get("dateTo");
    const searchParam = searchParams?.get("search") || "";

    // Estados simples
    setCurrentStatus(estadosParam);
    setCurrentClient(clientesParam);
    setCurrentRecruiter(reclutadoresParam);
    setCurrentTipo(tiposParam);

    // Oficinas (convertir a enum)
    const oficinasEnum: Oficina[] = oficinasParam
      .map((o) => (Oficina as any)[o])
      .filter(Boolean);
    setCurrentOficina(oficinasEnum);

    // Rango de fechas
    if (dateFromParam || dateToParam) {
      const from = dateFromParam ? new Date(dateFromParam) : undefined;
      const to = dateToParam ? new Date(dateToParam) : undefined;
      setDateRange({ from, to });
    } else {
      setDateRange(undefined);
    }

    // Sincronizar campo de búsqueda de posición en la UI
    table.getColumn("posicion")?.setFilterValue(searchParam);
  }, [
    searchParams,
    setCurrentStatus,
    setCurrentClient,
    setCurrentRecruiter,
    setCurrentTipo,
    setCurrentOficina,
    setDateRange,
    table,
  ]);

  const resetFilters = useCallback(() => {
    setCurrentStatus([]);
    setCurrentClient([]);
    setCurrentRecruiter([]);
    setCurrentTipo([]);
    setDateRange(undefined);
    setCurrentOficina([]);

    // Limpiar todos los filtros de la URL
    updateFilters({
      estados: undefined,
      clientes: undefined,
      reclutadores: undefined,
      tipos: undefined,
      oficinas: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      search: undefined,
    });
  }, [
    setCurrentStatus,
    setCurrentClient,
    setCurrentRecruiter,
    setCurrentTipo,
    setDateRange,
    setCurrentOficina,
    updateFilters,
  ]);

  const handleDateRangeChange = useCallback(
    (range: DateRange | undefined) => {
      setDateRange(range);

      if (!range || (!range.from && !range.to)) {
        updateFilters({ dateFrom: undefined, dateTo: undefined });
        return;
      }

      updateFilters({
        dateFrom: range.from?.toISOString(),
        dateTo: range.to?.toISOString(),
      });
    },
    [setDateRange, updateFilters]
  );

  const clearFilters = [
    {
      condition: currentOficina.length > 0,
      label: `Oficinas: ${currentOficina.length} seleccionada${
        currentOficina.length > 1 ? "s" : ""
      }`,
      clear: () => {
        setCurrentOficina([]);
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
      condition: currentClient.length > 0,
      label: `Clientes: ${currentClient.length} seleccionado${
        currentClient.length > 1 ? "s" : ""
      }`,
      clear: () => {
        setCurrentClient([]);
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
      condition: currentTipo.length > 0,
      label: `Tipos: ${currentTipo.length} seleccionado${
        currentTipo.length > 1 ? "s" : ""
      }`,
      clear: () => {
        setCurrentTipo([]);
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
          {/* Filtro de Estado - Con múltiple selección mediante checkboxes */}
          <div className={`space-y-${isCompact ? "1" : "2"}`}>
            <Label
              htmlFor="status-filter"
              className={`text-xs font-medium ${isCompact ? "sr-only" : ""}`}
            >
              Estados
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    currentStatus.length === 0 && "text-muted-foreground",
                    isCompact ? "h-8 text-xs" : "h-9 text-sm"
                  )}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  {currentStatus.length === 0
                    ? isCompact
                      ? "Estados"
                      : "Seleccionar"
                    : currentStatus.length === 1
                    ? statusOptions.find((s) => s.value === currentStatus[0])
                        ?.label
                    : `${currentStatus.length} estados`}
                  <ChevronDown className="ml-auto h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="start">
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Estados</h4>
                    {currentStatus.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCurrentStatus([]);
                          table.getColumn("estado")?.setFilterValue(undefined);
                        }}
                        className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Limpiar
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {statusOptions.map((status) => (
                      <div
                        key={status.value}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={status.value}
                          checked={currentStatus.includes(status.value)}
                          onCheckedChange={(checked) =>
                            handleStatusToggle(status.value, checked as boolean)
                          }
                        />
                        <label
                          htmlFor={status.value}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {status.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Filtro de Oficina - Con múltiple selección mediante checkboxes */}
          <div className={`space-y-${isCompact ? "1" : "2"}`}>
            <Label
              htmlFor="oficina-filter"
              className={`text-xs font-medium ${isCompact ? "sr-only" : ""}`}
            >
              Oficina
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    currentOficina.length === 0 && "text-muted-foreground",
                    isCompact ? "h-8 text-xs" : "h-9 text-sm"
                  )}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  {currentOficina.length === 0
                    ? isCompact
                      ? "Oficinas"
                      : "Seleccionar"
                    : currentOficina.length === 1
                    ? `Oficina ${
                        currentOficina[0] === Oficina.Oficina1 ? "1" : "2"
                      }`
                    : `${currentOficina.length} oficinas`}
                  <ChevronDown className="ml-auto h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="start">
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Oficinas</h4>
                    {currentOficina.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCurrentOficina([]);
                          table.getColumn("oficina")?.setFilterValue(undefined);
                        }}
                        className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Limpiar
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      {oficinaOptions.map((oficina) => (
                        <div
                          key={oficina.value}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={oficina.value}
                            checked={currentOficina.includes(oficina.value)}
                            onCheckedChange={(checked) =>
                              handleOficinaToggle(
                                oficina.value,
                                checked as boolean
                              )
                            }
                          />
                          <label
                            htmlFor={oficina.value}
                            className="text-sm cursor-pointer flex-1"
                          >
                            {oficina.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Filtro de Cliente con Búsqueda */}
          <div className={`space-y-${isCompact ? "1" : "2"}`}>
            <Label
              htmlFor="client-filter"
              className={`text-xs font-medium ${isCompact ? "sr-only" : ""}`}
            >
              Clientes
            </Label>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    currentClient.length === 0 && "text-muted-foreground",
                    isCompact ? "h-8 text-xs" : "h-9 text-sm"
                  )}
                >
                  <Users className="mr-2 h-4 w-4" />
                  {currentClient.length === 0
                    ? isCompact
                      ? "Clientes"
                      : "Seleccionar"
                    : currentClient.length === 1
                    ? clientes.find((c) => c.id === currentClient[0])?.cuenta
                    : `${currentClient.length} clientes`}
                  <ChevronDown className="ml-auto h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar cliente..." />
                  <CommandList>
                    <CommandEmpty>No se encontró el cliente.</CommandEmpty>
                    <CommandGroup>
                      <div className="p-2 flex items-center justify-between border-b">
                        <span className="text-xs font-medium text-muted-foreground">
                          Clientes
                        </span>
                        {currentClient.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setCurrentClient([]);
                              table
                                .getColumn("cliente")
                                ?.setFilterValue(undefined);
                            }}
                            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                          >
                            Limpiar
                          </Button>
                        )}
                      </div>
                      {clientes.map((client) => (
                        <CommandItem
                          key={client.id}
                          value={client.cuenta || client.id}
                          onSelect={() => {
                            handleClientToggle(
                              client.id,
                              !currentClient.includes(client.id)
                            );
                          }}
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <Checkbox
                            id={client.id}
                            checked={currentClient.includes(client.id)}
                            onCheckedChange={(checked) =>
                              handleClientToggle(client.id, checked as boolean)
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                          <label
                            htmlFor={client.id}
                            className="text-sm cursor-pointer flex-1"
                          >
                            {client.cuenta}
                          </label>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Filtro de Reclutador con Checkbox - Modificado */}
          <div className={`space-y-${isCompact ? "1" : "2"}`}>
            <Label
              htmlFor="recruiter-filter"
              className={`text-xs font-medium ${isCompact ? "sr-only" : ""}`}
            >
              Reclutadores
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    currentRecruiter.length === 0 && "text-muted-foreground",
                    isCompact ? "h-8 text-xs" : "h-9 text-sm"
                  )}
                >
                  <Users className="mr-2 h-4 w-4" />
                  {currentRecruiter.length === 0
                    ? isCompact
                      ? "Reclutadores"
                      : "Seleccionar"
                    : currentRecruiter.length === 1
                    ? reclutadores
                        .find((r) => r.id === currentRecruiter[0])
                        ?.name.split(" ")
                        .at(0)
                        ?.toString()
                    : `${currentRecruiter.length} reclutadores`}
                  <ChevronDown className="ml-auto h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="start">
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Reclutadores</h4>
                    {currentRecruiter.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCurrentRecruiter([]);
                          table
                            .getColumn("reclutador")
                            ?.setFilterValue(undefined);
                        }}
                        className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Limpiar
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {reclutadores.map((reclutador) => (
                      <div
                        key={reclutador.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={reclutador.id}
                          checked={currentRecruiter.includes(reclutador.id)}
                          onCheckedChange={(checked) =>
                            handleReclutadorToggle(
                              reclutador.id,
                              checked as boolean
                            )
                          }
                        />
                        <label
                          htmlFor={reclutador.id}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {reclutador.name.split(" ").slice(0, 2).join(" ")}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Filtro de Tipo - Con múltiple selección mediante checkboxes */}
          <div className={`space-y-${isCompact ? "1" : "2"}`}>
            <Label
              htmlFor="tipo-filter"
              className={`text-xs font-medium ${isCompact ? "sr-only" : ""}`}
            >
              Tipo
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    currentTipo.length === 0 && "text-muted-foreground",
                    isCompact ? "h-8 text-xs" : "h-9 text-sm"
                  )}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  {currentTipo.length === 0
                    ? isCompact
                      ? "Tipos"
                      : "Seleccionar"
                    : currentTipo.length === 1
                    ? currentTipo[0]
                    : `${currentTipo.length} tipos`}
                  <ChevronDown className="ml-auto h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="start">
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Tipos</h4>
                    {currentTipo.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCurrentTipo([]);
                          table.getColumn("tipo")?.setFilterValue(undefined);
                        }}
                        className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Limpiar
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tipo-nueva"
                        checked={currentTipo.includes(VacancyTipo.Nueva)}
                        onCheckedChange={(checked) =>
                          handleTipoToggle(
                            VacancyTipo.Nueva,
                            checked as boolean
                          )
                        }
                      />
                      <label
                        htmlFor="tipo-nueva"
                        className="text-sm cursor-pointer flex-1"
                      >
                        Nueva
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tipo-garantia"
                        checked={currentTipo.includes(VacancyTipo.Garantia)}
                        onCheckedChange={(checked) =>
                          handleTipoToggle(
                            VacancyTipo.Garantia,
                            checked as boolean
                          )
                        }
                      />
                      <label
                        htmlFor="tipo-garantia"
                        className="text-sm cursor-pointer flex-1"
                      >
                        Garantía
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tipo-recompra"
                        checked={currentTipo.includes(VacancyTipo.Recompra)}
                        onCheckedChange={(checked) =>
                          handleTipoToggle(
                            VacancyTipo.Recompra,
                            checked as boolean
                          )
                        }
                      />
                      <label
                        htmlFor="tipo-recompra"
                        className="text-sm cursor-pointer flex-1"
                      >
                        Recompra
                      </label>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
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
}

function TablePagination<TData>({ table }: PaginationProps<TData>) {
  const { pageIndex, pageSize: currentPageSize } = table.getState().pagination;
  const totalPages = table.getPageCount();
  // Cuando hay paginación manual, usar rowCount si está disponible
  const manual = (table.options as any).manualPagination;
  const rowCount = (table.options as any).rowCount as number | undefined;
  const totalRows =
    manual && typeof rowCount === "number"
      ? rowCount
      : table.getFilteredRowModel().rows.length;
  const selectedRows = table.getFilteredSelectedRowModel().rows.length;

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

          {/* Navegación de páginas */}
          <div className="flex items-center gap-4">
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
  totalCount,
  initialPageIndex,
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
  const [currentClient, setCurrentClient] = useState<string[]>([]);
  const [currentTipo, setCurrentTipo] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [currentOficina, setCurrentOficina] = useState<Oficina[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);
  const [showTopActions, setShowTopActions] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [pagination, setPagination] = useState({
    pageIndex: initialPageIndex ?? 0,
    pageSize: defaultPageSize,
  });

  // Configuración de la tabla con manualización para server-side
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onColumnOrderChange: setColumnOrder,
    onPaginationChange: setPagination,
    // Paginación manual (servidor)
    manualPagination: true,
    pageCount: totalCount
      ? Math.max(1, Math.ceil(totalCount / (pagination.pageSize || 1)))
      : 1,
    rowCount: totalCount,
    // Desactivar filtrado/sorting en cliente
    manualFiltering: true,
    manualSorting: true,
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
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Navegación optimizada con useTransition
  const navigateWithTransition = useCallback(
    (params: URLSearchParams) => {
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [pathname, router, startTransition]
  );

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
  }, [router]);

  // Memoize handlers to prevent unnecessary re-renders
  const handlePageSizeChange = useCallback(
    (value: string) => {
      const newSize = parseInt(value, 10);
      setPageSize(newSize);
      const params = new URLSearchParams(searchParams?.toString());
      params.set("page", "0");
      params.set("pageSize", String(newSize));
      navigateWithTransition(params);
    },
    [searchParams, navigateWithTransition]
  );

  // Debounce para búsquedas
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout>();

  const handleGlobalFilterChange = useCallback(
    (value: string) => {
      setGlobalFilter(value);

      // Limpiar timeout anterior
      if (searchDebounce) {
        clearTimeout(searchDebounce);
      }

      // Crear nuevo timeout para búsqueda
      const timeout = setTimeout(() => {
        table.setPageIndex(0);
        const params = new URLSearchParams(searchParams?.toString());
        params.set("page", "0");
        params.set("search", value);
        navigateWithTransition(params);
      }, 500); // 500ms de debounce

      setSearchDebounce(timeout);
    },
    [table, searchParams, navigateWithTransition, searchDebounce]
  );

  const handleTipoChange = useCallback(
    (value: string[]) => {
      setCurrentTipo(value);
      if (value.length === 0) {
        table.getColumn("tipo")?.setFilterValue(undefined);
      } else {
        table.getColumn("tipo")?.setFilterValue(value);
      }
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

  // Sincronizar cambios de paginación con la URL con useTransition
  useEffect(() => {
    const currentPageParam = Number(searchParams?.get("page") ?? 0);
    const currentSizeParam = Number(
      searchParams?.get("pageSize") ?? defaultPageSize
    );

    const pageChanged = pagination.pageIndex !== currentPageParam;
    const sizeChanged = pagination.pageSize !== currentSizeParam;

    if (pageChanged || sizeChanged) {
      const params = new URLSearchParams(searchParams?.toString());
      params.set("page", String(pagination.pageIndex));
      params.set("pageSize", String(pagination.pageSize));
      navigateWithTransition(params);
    }
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    searchParams,
    defaultPageSize,
    navigateWithTransition,
  ]);

  // Sincronizar cambios de sorting con la URL
  useEffect(() => {
    if (sorting.length > 0) {
      const sortConfig = sorting[0];
      const params = new URLSearchParams(searchParams?.toString());
      params.set("sortBy", sortConfig.id);
      params.set("sortOrder", sortConfig.desc ? "desc" : "asc");
      params.set("page", "0");
      navigateWithTransition(params);
    } else {
      const params = new URLSearchParams(searchParams?.toString());
      params.delete("sortBy");
      params.delete("sortOrder");
      navigateWithTransition(params);
    }
  }, [sorting, searchParams, navigateWithTransition]);

  const handleOficinaChange = useCallback(
    (value: Oficina[]) => {
      setCurrentOficina(value);
      if (value.length === 0) {
        table.getColumn("oficina")?.setFilterValue(undefined);
      } else {
        table.getColumn("oficina")?.setFilterValue(value);
      }
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
        setCurrentStatus={setCurrentStatus}
        currentClient={currentClient}
        setCurrentClient={setCurrentClient}
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
      <TablePagination table={table} />
    </div>
  );
}
