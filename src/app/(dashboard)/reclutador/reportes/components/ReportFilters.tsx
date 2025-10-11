"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CalendarIcon, FilterIcon, RefreshCwIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { Card } from "@/components/ui/card";

interface ReportFiltersProps {
  reclutadores: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  onFiltersChange: (filters: {
    reclutadorId?: string;
    fechaInicio: Date;
    fechaFin: Date;
  }) => void;
  isLoading?: boolean;
}

export function ReportFilters({
  reclutadores,
  onFiltersChange,
  isLoading = false,
}: ReportFiltersProps) {
  const [selectedReclutador, setSelectedReclutador] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Primer día del mes actual
    to: new Date(), // Hoy
  });

  const handleApplyFilters = () => {
    if (!dateRange?.from || !dateRange?.to) {
      return;
    }

    onFiltersChange({
      reclutadorId:
        selectedReclutador === "all" ? undefined : selectedReclutador,
      fechaInicio: dateRange.from,
      fechaFin: dateRange.to,
    });
  };

  const handleQuickDateRange = (days: number) => {
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - days);

    setDateRange({
      from: startDate,
      to: today,
    });
  };

  const handleCurrentMonth = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    setDateRange({
      from: firstDay,
      to: today,
    });
  };

  const handlePreviousMonth = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);

    setDateRange({
      from: firstDay,
      to: lastDay,
    });
  };

  return (
    <Card className="p-6 ">
      <div className="flex items-center gap-2 mb-4">
        <FilterIcon className="h-5 w-5 text-gray-700" />
        <h3 className="text-lg font-semibold text-gray-900">
          Filtros de Reporte
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Selector de Reclutador */}
        <div className="space-y-2">
          <Label htmlFor="reclutador">Reclutador</Label>
          <Select
            value={selectedReclutador}
            onValueChange={setSelectedReclutador}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar reclutador" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los reclutadores</SelectItem>
              {reclutadores.map((reclutador) => (
                <SelectItem key={reclutador.id} value={reclutador.id}>
                  {reclutador.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selector de Rango de Fechas */}
        <div className="space-y-2">
          <Label>Rango de Fechas</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd/MM/yyyy", { locale: es })} -{" "}
                      {format(dateRange.to, "dd/MM/yyyy", { locale: es })}
                    </>
                  ) : (
                    format(dateRange.from, "dd/MM/yyyy", { locale: es })
                  )
                ) : (
                  <span>Seleccionar fechas</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                locale={es}
                captionLayout="dropdown"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Botón Generar Reporte */}
        <div className="space-y-2">
          <Label>&nbsp;</Label>
          <Button
            onClick={handleApplyFilters}
            disabled={!dateRange?.from || !dateRange?.to || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <RefreshCwIcon className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              "Generar Reporte"
            )}
          </Button>
        </div>
      </div>

      {/* Filtros Rápidos de Fecha */}
      <div className="border-t pt-4">
        <Label className="text-sm mb-2 block">Filtros Rápidos:</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickDateRange(7)}
          >
            Últimos 7 días
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickDateRange(30)}
          >
            Últimos 30 días
          </Button>
          <Button variant="outline" size="sm" onClick={handleCurrentMonth}>
            Mes actual
          </Button>
          <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
            Mes anterior
          </Button>
        </div>
      </div>
    </Card>
  );
}
