"use client";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, FilterIcon, SearchIcon, X } from "lucide-react";
import { Oficina, User } from "@prisma/client";
import { LeadWithRelations } from "../page";
import { Input } from "@/components/ui/input";
import { cn } from "@/core/lib/utils";

interface KanbanFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  generadores: User[];
  initialLeads: LeadWithRelations[];
}

export interface FilterState {
  generadorId: string | null;
  fechaCreacion: { from: Date | null; to: Date | null };
  oficina: Oficina | null;
  searchTerm: string;
}

export function KanbanFilters({
  onFilterChange,
  generadores,
}: KanbanFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    generadorId: null,
    fechaCreacion: { from: null, to: null },
    oficina: null,
    searchTerm: "",
  });

  // Estado separado para el input de búsqueda con debounce
  const [searchInput, setSearchInput] = useState<string>("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (filters.searchTerm !== searchInput) {
        const newFilters = { ...filters, searchTerm: searchInput };
        setFilters(newFilters);
        onFilterChange(newFilters);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [searchInput, filters, onFilterChange]);

  const uniqueOffices = Array.from(
    new Set(generadores.map((gen) => gen.Oficina))
  );

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    if (key === "searchTerm") {
      setSearchInput(value as string);
      return;
    }
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const resetFilters = {
      generadorId: null,
      fechaCreacion: { from: null, to: null },
      oficina: null,
      searchTerm: "",
    };

    setFilters(resetFilters);
    setSearchInput("");
    onFilterChange(resetFilters);
  };

  const clearSingleFilter = (filterKey: keyof FilterState) => {
    if (filterKey === "fechaCreacion") {
      const newFilters = {
        ...filters,
        fechaCreacion: { from: null, to: null },
      };
      setFilters(newFilters);
      onFilterChange(newFilters);
    } else if (filterKey === "searchTerm") {
      const newFilters = { ...filters, searchTerm: "" };
      setFilters(newFilters);
      setSearchInput("");
      onFilterChange(newFilters);
    } else {
      const newFilters = { ...filters, [filterKey]: null } as FilterState;
      setFilters(newFilters);
      onFilterChange(newFilters);
    }
  };

  const hasActiveFilters =
    filters.generadorId ||
    filters.fechaCreacion.from ||
    filters.fechaCreacion.to ||
    filters.oficina ||
    filters.searchTerm;

  return (
    <div className="p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center">
          <FilterIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtros:</span>
        </div>
        <div className="relative">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Sector, Empresa..."
            value={searchInput}
            onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
            className="pl-8 h-9 w-[200px]"
          />
        </div>

        {/* Generator filter */}
        <Select
          value={filters.generadorId === null ? "all" : filters.generadorId}
          onValueChange={(value) =>
            handleFilterChange("generadorId", value === "all" ? null : value)
          }
        >
          <SelectTrigger className="w-[200px] h-9">
            <SelectValue placeholder="Generador" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los generadores</SelectItem>
            {generadores.map((gen) => (
              <SelectItem key={gen.id} value={gen.id}>
                {gen.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Office filter */}
        <Select
          value={filters.oficina === null ? "all" : (filters.oficina as any)}
          onValueChange={(value) =>
            handleFilterChange(
              "oficina",
              value === "all" ? null : (value as Oficina)
            )
          }
        >
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="Oficina" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las oficinas</SelectItem>
            {uniqueOffices.map((oficina) => (
              <SelectItem key={oficina} value={oficina as any}>
                {oficina}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date range filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[240px] justify-start text-left font-normal h-9",
                !filters.fechaCreacion.from &&
                  !filters.fechaCreacion.to &&
                  "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.fechaCreacion.from ? (
                filters.fechaCreacion.to ? (
                  <>
                    {format(filters.fechaCreacion.from, "dd/MM/yyyy", {
                      locale: es,
                    })}{" "}
                    -{" "}
                    {format(filters.fechaCreacion.to, "dd/MM/yyyy", {
                      locale: es,
                    })}
                  </>
                ) : (
                  format(filters.fechaCreacion.from, "dd/MM/yyyy", {
                    locale: es,
                  })
                )
              ) : (
                <span>Rango de fechas</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={{
                from: filters.fechaCreacion.from || undefined,
                to: filters.fechaCreacion.to || undefined,
              }}
              onSelect={(range) => {
                handleFilterChange("fechaCreacion", {
                  from: range?.from || null,
                  to: range?.to || null,
                });
              }}
              initialFocus
              numberOfMonths={2}
              locale={es}
            />
          </PopoverContent>
        </Popover>

        {/* Clear filters button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-9"
          >
            <X className="mr-2 h-4 w-4" />
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  );
}
