"use client";
import { useEffect, useState } from "react";
import { MoreHorizontal, Calendar, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import {
  useRecruiterStats,
  PeriodType,
} from "@/hooks/vacancy/use-recruiter-stats";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface RecruiterPlacementChartProps {
  recruiterId: string;
}

export const RecruiterPlacementChart = ({
  recruiterId,
}: RecruiterPlacementChartProps) => {
  const {
    isLoading,
    error,
    placementData,
    currentPeriod,
    totalPlacements,
    dateRange,
    fetchPlacementStats,
  } = useRecruiterStats(recruiterId);

  const [selectedPeriod, setSelectedPeriod] =
    useState<PeriodType>("last_month");
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedQuarter, setSelectedQuarter] = useState<1 | 2 | 3 | 4>(
    Math.ceil((new Date().getMonth() + 1) / 3) as 1 | 2 | 3 | 4
  );

  // Cargar datos iniciales
  useEffect(() => {
    if (recruiterId) {
      fetchPlacementStats(selectedPeriod, selectedYear, selectedQuarter);
    }
  }, [
    recruiterId,
    fetchPlacementStats,
    selectedPeriod,
    selectedYear,
    selectedQuarter,
  ]);

  const handlePeriodChange = (period: PeriodType) => {
    setSelectedPeriod(period);
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(parseInt(year));
  };

  const handleQuarterChange = (quarter: string) => {
    setSelectedQuarter(parseInt(quarter) as 1 | 2 | 3 | 4);
  };

  // Configuración del gráfico
  const chartConfig: Record<string, { label: string; color: string }> = {
    placements: { label: "Placements", color: "#3b82f6" },
  };

  // Formatear datos para el gráfico
  const chartData = placementData.map((item) => ({
    period: item.label,
    placements: item.placements,
  }));

  // Generar descripción del período
  const getPerionDescription = () => {
    if (!dateRange) return "";

    const startDate = format(new Date(dateRange.start), "MMM yyyy", {
      locale: es,
    });
    const endDate = format(new Date(dateRange.end), "MMM yyyy", { locale: es });

    switch (currentPeriod) {
      case "last_month":
        return `Último mes (${startDate})`;
      case "last_6_months":
        return `Últimos 6 meses (${startDate} - ${endDate})`;
      case "year":
        return `Año ${selectedYear}`;
      case "quarter":
        return `Q${selectedQuarter} ${selectedYear}`;
      default:
        return `${startDate} - ${endDate}`;
    }
  };

  // Generar opciones de años (últimos 3 años + año actual + próximo año)
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let i = currentYear - 2; i <= currentYear + 1; i++) {
    yearOptions.push(i);
  }

  return (
    <Card className="shadow-sm h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Rendimiento de Placements
            </CardTitle>
            <CardDescription>{getPerionDescription()}</CardDescription>
          </div>

          {/* Controles de período */}
          <div className="flex items-center gap-2">
            <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-36 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last_month">Último mes</SelectItem>
                <SelectItem value="last_6_months">Últimos 6 meses</SelectItem>
                <SelectItem value="year">Por año</SelectItem>
                <SelectItem value="quarter">Por cuatrimestre</SelectItem>
              </SelectContent>
            </Select>

            {/* Selector de año para "year" y "quarter" */}
            {(selectedPeriod === "year" || selectedPeriod === "quarter") && (
              <Select
                value={selectedYear.toString()}
                onValueChange={handleYearChange}
              >
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Selector de cuatrimestre */}
            {selectedPeriod === "quarter" && (
              <Select
                value={selectedQuarter.toString()}
                onValueChange={handleQuarterChange}
              >
                <SelectTrigger className="w-16 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Q1</SelectItem>
                  <SelectItem value="2">Q2</SelectItem>
                  <SelectItem value="3">Q3</SelectItem>
                  <SelectItem value="4">Q4</SelectItem>
                </SelectContent>
              </Select>
            )}

            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Estadística rápida */}
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-gray-600">
              Total: {totalPlacements} placements
            </span>
          </div>
          {error && <span className="text-red-500 text-xs">{error}</span>}
        </div>
      </CardHeader>

      <CardContent>
        {/* Contenedor con altura fija para evitar el salto */}
        <div className="w-full h-[378px] relative">
          {isLoading ? (
            <div className="absolute inset-0 flex justify-center items-center bg-white/80 backdrop-blur-sm z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : null}

          {chartData.length === 0 && !isLoading ? (
            <div className="absolute inset-0 flex flex-col justify-center items-center text-gray-500">
              <Calendar className="h-12 w-12 mb-2 opacity-50" />
              <p className="text-sm">No hay datos de placements</p>
              <p className="text-xs">para el período seleccionado</p>
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="w-full h-full">
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  opacity={0.2}
                />
                <XAxis
                  dataKey="period"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) =>
                    value.length > 8 ? `${value.slice(0, 8)}...` : value
                  }
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar
                  dataKey="placements"
                  fill="var(--color-placements)"
                  radius={4}
                />
              </BarChart>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
