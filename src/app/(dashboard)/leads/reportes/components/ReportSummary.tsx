"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Phone,
  MessageSquare,
  Heart,
  Calendar,
  CheckCircle,
  Award,
  Target,
  TrendingUp,
} from "lucide-react";

interface ReportSummaryProps {
  summary: {
    totalGeneradores: number;
    totalContactos: number;
    totalSocialSelling: number;
    totalContactoCalido: number;
    totalCitaAgendada: number;
    totalCitaAtendida: number;
    totalCitaValidada: number;
    totalAsignadas: number;
    totalGeneral: number;
  };
}

export function ReportSummary({ summary }: ReportSummaryProps) {
  const stats = [
    {
      title: "Generadores",
      value: summary.totalGeneradores,
      icon: Users,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      title: "Contactos",
      value: summary.totalContactos,
      icon: Phone,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
    },
    {
      title: "Social Selling",
      value: summary.totalSocialSelling,
      icon: MessageSquare,
      color: "bg-pink-500",
      bgColor: "bg-pink-50",
      textColor: "text-pink-700",
    },
    {
      title: "Contacto Cálido",
      value: summary.totalContactoCalido,
      icon: Heart,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700",
    },
    {
      title: "Citas Agendadas",
      value: summary.totalCitaAgendada,
      icon: Calendar,
      color: "bg-yellow-500",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-700",
    },
    {
      title: "Citas Atendidas",
      value: summary.totalCitaAtendida,
      icon: CheckCircle,
      color: "bg-indigo-500",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-700",
    },
    {
      title: "Citas Validadas",
      value: summary.totalCitaValidada,
      icon: Award,
      color: "bg-teal-500",
      bgColor: "bg-teal-50",
      textColor: "text-teal-700",
    },
    {
      title: "Asignadas",
      value: summary.totalAsignadas,
      icon: Target,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
    },
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Resumen General</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-2 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.textColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Card especial para el total */}
        <Card className="border-2 border-gray-800 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Total General
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.totalGeneral}
                </p>
              </div>
              <div className="p-2 rounded-full bg-gray-100">
                <TrendingUp className="h-5 w-5 text-gray-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
