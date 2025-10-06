"use client";
import { MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

interface FinanceData {
  month: string;
  income: number;
  expense: number;
}

export const FinanceChart = () => {
  const data: FinanceData[] = [
    { month: "Ene", income: 4000, expense: 2400 },
    { month: "Feb", income: 3000, expense: 1398 },
    { month: "Mar", income: 2000, expense: 9800 },
    { month: "Abr", income: 2780, expense: 3908 },
    { month: "May", income: 1890, expense: 4800 },
    { month: "Jun", income: 2390, expense: 3800 },
    { month: "Jul", income: 3490, expense: 4300 },
    { month: "Ago", income: 3490, expense: 4300 },
    { month: "Sep", income: 3490, expense: 4300 },
    { month: "Oct", income: 3490, expense: 4300 },
    { month: "Nov", income: 3490, expense: 4300 },
    { month: "Dic", income: 3490, expense: 4300 },
  ];

  const chartConfig: Record<string, { label: string; color: string }> = {
    expense: { label: "Gastos", color: "#94a3b8" },
    income: { label: "Ingresos", color: "#3b82f6" },
  };

  return (
    <Card className="shadow-sm h-[400px] flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-base">Finanzas</CardTitle>
            <CardDescription>Evolución anual</CardDescription>
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-4 min-h-0">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <LineChart
            accessibilityLayer
            data={data}
            margin={{ left: 12, right: 12, top: 10, bottom: 5 }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              opacity={0.2}
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={true} content={<ChartTooltipContent />} />
            <Line
              dataKey="income"
              type="monotone"
              stroke="var(--color-income)"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              dataKey="expense"
              type="monotone"
              stroke="var(--color-expense)"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
