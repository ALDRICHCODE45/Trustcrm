"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Bell,
  CheckCircle,
  Eye,
  TrendingUp,
  TrendingDown,
  Clock,
} from "lucide-react";
import { cn } from "@/core/lib/utils";

interface NotificationStatsProps {
  stats: {
    total: number;
    unread: number;
    read: number;
  };
  className?: string;
}

export function NotificationStats({
  stats,
  className,
}: NotificationStatsProps) {
  const readPercentage = stats.total > 0 ? (stats.read / stats.total) * 100 : 0;
  const unreadPercentage =
    stats.total > 0 ? (stats.unread / stats.total) * 100 : 0;

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4", className)}>
      {/* Total de notificaciones */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total</CardTitle>
          <Bell className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            Notificaciones en total
          </p>
        </CardContent>
      </Card>

      {/* Notificaciones no leídas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">No leídas</CardTitle>
          <Eye className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.unread}</div>
          <div className="flex items-center gap-2 mt-2">
            <Progress value={unreadPercentage} className="flex-1" />
            <span className="text-xs text-muted-foreground">
              {unreadPercentage.toFixed(0)}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Requieren atención
          </p>
        </CardContent>
      </Card>

      {/* Notificaciones leídas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Leídas</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.read}</div>
          <div className="flex items-center gap-2 mt-2">
            <Progress value={readPercentage} className="flex-1" />
            <span className="text-xs text-muted-foreground">
              {readPercentage.toFixed(0)}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Procesadas</p>
        </CardContent>
      </Card>
    </div>
  );
}

interface NotificationTrendProps {
  currentStats: {
    total: number;
    unread: number;
    read: number;
  };
  previousStats?: {
    total: number;
    unread: number;
    read: number;
  };
}

export function NotificationTrend({
  currentStats,
  previousStats,
}: NotificationTrendProps) {
  if (!previousStats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Tendencias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No hay datos suficientes para mostrar tendencias
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalChange = currentStats.total - previousStats.total;
  const unreadChange = currentStats.unread - previousStats.unread;
  const readChange = currentStats.read - previousStats.read;

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Clock className="h-4 w-4 text-gray-500" />;
  };

  const getTrendText = (change: number) => {
    if (change > 0) return `+${change}`;
    if (change < 0) return `${change}`;
    return "Sin cambios";
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Tendencias
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Total</span>
            <div className="flex items-center gap-2">
              {getTrendIcon(totalChange)}
              <span
                className={cn(
                  "text-sm font-medium",
                  getTrendColor(totalChange)
                )}
              >
                {getTrendText(totalChange)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">No leídas</span>
            <div className="flex items-center gap-2">
              {getTrendIcon(unreadChange)}
              <span
                className={cn(
                  "text-sm font-medium",
                  getTrendColor(unreadChange)
                )}
              >
                {getTrendText(unreadChange)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Leídas</span>
            <div className="flex items-center gap-2">
              {getTrendIcon(readChange)}
              <span
                className={cn("text-sm font-medium", getTrendColor(readChange))}
              >
                {getTrendText(readChange)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
