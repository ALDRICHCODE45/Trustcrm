// FilterBar.tsx - Componente para los filtros
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon, FilterX, Search } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Table } from "@tanstack/react-table";
import { VacancyWithRelations } from "@/app/(dashboard)/reclutador/components/ReclutadorColumns";

// Validación de formulario con zod
const FilterSchema = z.object({
  reclutador: z.string().optional(),
  estado: z.string().optional(),
  tipo: z.string().optional(),
  cliente: z.string().optional(),
  puesto: z.string().optional(),
  fechaDesde: z.date().optional(),
  fechaHasta: z.date().optional(),
  salarioMin: z.string().optional(),
  salarioMax: z.string().optional(),
});

type FilterValues = z.infer<typeof FilterSchema>;

interface FilterBarProps {
  table: Table<VacancyWithRelations>;
  reclutadores: string[];
  estados: string[];
  tipos: string[];
  clientes: string[];
}

export function FilterBar({
  table,
  reclutadores,
  estados,
  tipos,
  clientes,
}: FilterBarProps) {
  const [filtersActive, setFiltersActive] = useState(false);

  const form = useForm<FilterValues>({
    resolver: zodResolver(FilterSchema),
    defaultValues: {
      reclutador: "",
      estado: "",
      tipo: "",
      cliente: "",
      puesto: "",
      fechaDesde: undefined,
      fechaHasta: undefined,
      salarioMin: "",
      salarioMax: "",
    },
  });

  // Aplicar filtros
  const applyFilters = (values: FilterValues) => {
    // Limpiamos filtros actuales
    table.getAllColumns().forEach((column) => {
      column.setFilterValue(undefined);
    });

    // Aplicamos nuevos filtros
    if (values.reclutador) {
      table.getColumn("reclutador")?.setFilterValue(values.reclutador);
    }

    if (values.estado) {
      table.getColumn("estado")?.setFilterValue(values.estado);
    }

    if (values.tipo) {
      table.getColumn("tipo")?.setFilterValue(values.tipo);
    }

    if (values.cliente) {
      table.getColumn("cliente")?.setFilterValue(values.cliente);
    }

    if (values.puesto) {
      table.getColumn("posicion")?.setFilterValue(values.puesto);
    }

    // Filtro de rango de fechas
    if (values.fechaDesde || values.fechaHasta) {
      table.getColumn("mesAño")?.setFilterValue({
        from: values.fechaDesde,
        to: values.fechaHasta,
      });
    }

    // Filtro de rango de salarios
    if (values.salarioMin || values.salarioMax) {
      table.getColumn("salario")?.setFilterValue({
        min: values.salarioMin ? parseFloat(values.salarioMin) : undefined,
        max: values.salarioMax ? parseFloat(values.salarioMax) : undefined,
      });
    }

    setFiltersActive(true);
  };

  // Restablecer filtros
  const resetFilters = () => {
    form.reset();

    // Limpiamos todos los filtros
    table.getAllColumns().forEach((column) => {
      column.setFilterValue(undefined);
    });

    setFiltersActive(false);
  };

  return (
    <div className="bg-card rounded-md p-4 mb-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(applyFilters)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtro de Reclutador */}
            <FormField
              control={form.control}
              name="reclutador"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reclutador</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar reclutador" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {reclutadores.map((reclutador) => (
                        <SelectItem key={reclutador} value={reclutador}>
                          {reclutador}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {/* Filtro de Estado */}
            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {estados.map((estado) => (
                        <SelectItem key={estado} value={estado}>
                          {estado}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {/* Filtro de Tipo */}
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {tipos.map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                          {tipo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {/* Filtro de Cliente */}
            <FormField
              control={form.control}
              name="cliente"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {clientes.map((cliente) => (
                        <SelectItem key={cliente} value={cliente}>
                          {cliente}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtro de Puesto/Posición */}
            <FormField
              control={form.control}
              name="puesto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Posición</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar posición..."
                        className="pl-8"
                        {...field}
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Filtro de Fecha Desde */}
            <FormField
              control={form.control}
              name="fechaDesde"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha desde</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={`pl-3 text-left font-normal ${
                            !field.value && "text-muted-foreground"
                          }`}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy", { locale: es })
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        locale={es}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />

            {/* Filtro de Fecha Hasta */}
            <FormField
              control={form.control}
              name="fechaHasta"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha hasta</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={`pl-3 text-left font-normal ${
                            !field.value && "text-muted-foreground"
                          }`}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy", { locale: es })
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        locale={es}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />

            {/* Rango de Salario */}
            <div className="space-y-2">
              <FormLabel>Rango Salarial</FormLabel>
              <div className="flex space-x-2">
                <FormField
                  control={form.control}
                  name="salarioMin"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input type="number" placeholder="Min $" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="salarioMax"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input type="number" placeholder="Max $" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <div>
              {filtersActive && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetFilters}
                  className="flex items-center space-x-1"
                >
                  <FilterX className="h-4 w-4" />
                  <span>Limpiar filtros</span>
                </Button>
              )}
            </div>
            <Button type="submit">Aplicar filtros</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
