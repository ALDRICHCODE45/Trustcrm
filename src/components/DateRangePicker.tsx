"use client";
import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/core/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  value: DateRange | undefined;
  onChange: (dateRange: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Rango de fechas",
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = (range: DateRange | undefined) => {
    onChange(range);
  };

  const handleClear = () => {
    onChange(undefined);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          id="date-range"
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value?.from ? (
            value.to ? (
              <>
                {format(value.from, "EEE d/M/yy", { locale: es })} -{" "}
                {format(value.to, "EEE d/M/yy", { locale: es })}
              </>
            ) : (
              format(value.from, "EEE d/M/yy", { locale: es })
            )
          ) : (
            placeholder
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          captionLayout="dropdown"
          mode="range"
          defaultMonth={value?.from}
          selected={value}
          onSelect={handleSelect}
          numberOfMonths={2}
          locale={es}
        />
        <div className="p-3 border-t border-border flex justify-end">
          <Button size="sm" variant="outline" onClick={handleClear}>
            Limpiar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
