"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Briefcase,
  Search,
  UserCheck,
  CheckCircle2,
  Trophy,
  XCircle,
  AlertCircle,
  PauseCircle,
  TrendingUp,
} from "lucide-react";

interface ReportSummaryProps {
  summary: {
    totalReclutadores: number;
    totalQuickMeeting: number;
    totalHunting: number;
    totalEntrevistas: number;
    totalPrePlacement: number;
    totalPlacement: number;
    totalCancelada: number;
    totalPerdida: number;
    totalStandBy: number;
    totalGeneral: number;
  };
}

export function ReportSummary({ summary }: ReportSummaryProps) {
  const stats = [
    {
      title: "Reclutadores",
      value: summary.totalReclutadores,
      icon: Users,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      title: "Quick Meeting",
      value: summary.totalQuickMeeting,
      icon: Briefcase,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
    },
    {
      title: "Hunting",
      value: summary.totalHunting,
      icon: Search,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700",
    },
    {
      title: "Entrevistas",
      value: summary.totalEntrevistas,
      icon: UserCheck,
      color: "bg-yellow-500",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-700",
    },
    {
      title: "Pre-Placement",
      value: summary.totalPrePlacement,
      icon: CheckCircle2,
      color: "bg-indigo-500",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-700",
    },
    {
      title: "Placement",
      value: summary.totalPlacement,
      icon: Trophy,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
    },
    {
      title: "Canceladas",
      value: summary.totalCancelada,
      icon: XCircle,
      color: "bg-red-500",
      bgColor: "bg-red-50",
      textColor: "text-red-700",
    },
    {
      title: "Perdidas",
      value: summary.totalPerdida,
      icon: AlertCircle,
      color: "bg-gray-500",
      bgColor: "bg-gray-50",
      textColor: "text-gray-700",
    },
    {
      title: "Stand By",
      value: summary.totalStandBy,
      icon: PauseCircle,
      color: "bg-pink-500",
      bgColor: "bg-pink-50",
      textColor: "text-pink-700",
    },
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Resumen General</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
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
