"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarIcon,
  Filter,
  Search,
  X,
  RefreshCw,
  CheckSquare,
  Eye,
  Trash2,
  Bell,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/core/lib/utils";
import { NotificationStatus, NotificationType } from "@prisma/client";
import { DateRange } from "react-day-picker";

export interface NotificationFilters {
  status: NotificationStatus | "ALL";
  type: NotificationType | "ALL";
  dateRange: DateRange | undefined;
  search: string;
}

interface NotificationFiltersProps {
  filters: NotificationFilters;
  onFiltersChange: (filters: NotificationFilters) => void;
  onMarkAllAsRead: () => void;
  onDeleteAllRead: () => void;
  isMarkingAllAsRead: boolean;
  isDeletingAllRead: boolean;
  stats?: {
    total: number;
    unread: number;
    read: number;
  };
}

export function NotificationFilters({
  filters,
  onFiltersChange,
  onMarkAllAsRead,
  onDeleteAllRead,
  isMarkingAllAsRead,
  isDeletingAllRead,
  stats,
}: NotificationFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof NotificationFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      status: "ALL",
      type: "ALL",
      dateRange: undefined,
      search: "",
    });
  };

  const hasActiveFilters =
    filters.status !== "ALL" ||
    filters.type !== "ALL" ||
    filters.dateRange?.from ||
    filters.dateRange?.to ||
    filters.search.trim() !== "";

  const notificationTypes = [
    { value: "ALL", label: "Todos los tipos" },
    { value: NotificationType.TASK_INITIALIZED, label: "Tarea Iniciada" },
    { value: NotificationType.TASK_COMPLETED, label: "Tarea Completada" },
    { value: NotificationType.TASK_OVERDUE, label: "Tarea Vencida" },
    { value: NotificationType.EDIT, label: "Edición" },
  ];

  const statusOptions = [
    { value: "ALL", label: "Todos los estados" },
    { value: NotificationStatus.UNREAD, label: "No leídas" },
    { value: NotificationStatus.READ, label: "Leídas" },
  ];

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Notificaciones
          </CardTitle>
          <div className="flex items-center gap-2">
            {stats && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="gap-1">
                  <Bell className="h-3 w-3" />
                  {stats.total}
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Eye className="h-3 w-3" />
                  {stats.unread}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <CheckSquare className="h-3 w-3" />
                  {stats.read}
                </Badge>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Ocultar" : "Mostrar"} filtros
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Filtros básicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar en mensajes..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtro por estado */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  handleFilterChange(
                    "status",
                    value as NotificationStatus | "ALL"
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por tipo */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select
                value={filters.type}
                onValueChange={(value) =>
                  handleFilterChange("type", value as NotificationType | "ALL")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {notificationTypes.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por fecha */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Fechas</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.dateRange?.from &&
                        !filters.dateRange?.to &&
                        "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange?.from ? (
                      filters.dateRange?.to ? (
                        <>
                          {format(filters.dateRange.from, "dd/MM/yyyy", {
                            locale: es,
                          })}{" "}
                          -{" "}
                          {format(filters.dateRange.to, "dd/MM/yyyy", {
                            locale: es,
                          })}
                        </>
                      ) : (
                        format(filters.dateRange.from, "dd/MM/yyyy", {
                          locale: es,
                        })
                      )
                    ) : (
                      "Fechas"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                  <Calendar
                    captionLayout="dropdown"
                    mode="range"
                    selected={filters.dateRange}
                    onSelect={(range) => handleFilterChange("dateRange", range)}
                    numberOfMonths={2}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Acciones masivas */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onMarkAllAsRead}
                disabled={isMarkingAllAsRead || stats?.unread === 0}
                className="gap-2"
              >
                <CheckSquare className="h-4 w-4" />
                {isMarkingAllAsRead
                  ? "Marcando..."
                  : "Marcar todas como leídas"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDeleteAllRead}
                disabled={isDeletingAllRead || stats?.read === 0}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {isDeletingAllRead ? "Eliminando..." : "Eliminar leídas"}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Limpiar filtros
                </Button>
              )}
            </div>
          </div>

          {/* Indicadores de filtros activos */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2">
              {filters.status !== "ALL" && (
                <Badge variant="secondary" className="gap-1">
                  Estado:{" "}
                  {statusOptions.find((s) => s.value === filters.status)?.label}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleFilterChange("status", "ALL")}
                  />
                </Badge>
              )}
              {filters.type !== "ALL" && (
                <Badge variant="secondary" className="gap-1">
                  Tipo:{" "}
                  {
                    notificationTypes.find((t) => t.value === filters.type)
                      ?.label
                  }
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleFilterChange("type", "ALL")}
                  />
                </Badge>
              )}
              {filters.dateRange?.from && (
                <Badge variant="secondary" className="gap-1">
                  Fechas:{" "}
                  {format(filters.dateRange.from, "dd/MM/yyyy", { locale: es })}
                  {filters.dateRange.to &&
                    ` - ${format(filters.dateRange.to, "dd/MM/yyyy", {
                      locale: es,
                    })}`}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleFilterChange("dateRange", undefined)}
                  />
                </Badge>
              )}
              {filters.search.trim() !== "" && (
                <Badge variant="secondary" className="gap-1">
                  Búsqueda: {filters.search}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleFilterChange("search", "")}
                  />
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
