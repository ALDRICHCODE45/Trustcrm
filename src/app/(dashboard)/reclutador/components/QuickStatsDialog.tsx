"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  Users,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Loader2,
} from "lucide-react";
import {
  getVacancyStatsByRecruiter,
  type ReclutadorStats,
} from "@/actions/vacantes/stats";

interface QuickStatsDialogProps {
  trigger?: React.ReactNode;
}

const getEstadoPoint = (estado: string) => {
  switch (estado) {
    case "hunting":
      return (
        <span
          className="size-3 rounded-full bg-amber-500"
          aria-hidden="true"
        ></span>
      );
    case "entrevistas":
      return (
        <span
          className="size-3 rounded-full bg-blue-500"
          aria-hidden="true"
        ></span>
      );
    case "placement":
      return (
        <span
          className="size-3 rounded-full bg-green-500"
          aria-hidden="true"
        ></span>
      );
    case "canceladas":
      return (
        <span
          className="size-3 rounded-full bg-red-500"
          aria-hidden="true"
        ></span>
      );
    case "perdidas":
      return (
        <span
          className="size-3 rounded-full bg-gray-500"
          aria-hidden="true"
        ></span>
      );
    case "prePlacement":
      return (
        <span
          className="size-3 rounded-full bg-emerald-500"
          aria-hidden="true"
        ></span>
      );
    case "quickMeeting":
      return (
        <span
          className="size-3 rounded-full bg-purple-500"
          aria-hidden="true"
        ></span>
      );
    default:
      return null;
  }
};

interface EstadoChipProps {
  estado: string;
  count: number;
  label: string;
}

const EstadoChip = ({ estado, count, label }: EstadoChipProps) => (
  <div className="flex items-center justify-center gap-2 p-2 rounded-lg border border-gray-200 dark:border-gray-700 min-w-[80px]">
    <div
      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium`}
    >
      {getEstadoPoint(estado)}
      <span className="text-sm">{count}</span>
    </div>
    <span className="text-sm text-muted-foreground text-center leading-tight">
      {label}
    </span>
  </div>
);

export default function QuickStatsDialog({ trigger }: QuickStatsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState<ReclutadorStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (open && stats.length === 0) {
      await loadStats();
    }
  };

  const loadStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getVacancyStatsByRecruiter();
      setStats(data);
    } catch (err) {
      setError("Error al cargar las estadísticas");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const totalVacantesGlobal = stats.reduce(
    (sum, recruiter) => sum + recruiter.totalVacantes,
    0
  );
  const totalHunting = stats.reduce(
    (sum, recruiter) => sum + recruiter.hunting,
    0
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Estadísticas Rápidas
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="min-w-[850px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Estadísticas Rápidas de Vacantes
          </DialogTitle>
          <DialogDescription>
            Vista general del estado de vacantes por reclutador
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Cargando estadísticas...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-8 text-red-500">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {!isLoading && !error && stats.length > 0 && (
          <div className="space-y-6">
            {/* Resumen Global */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Vacantes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalVacantesGlobal}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Hunting
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {totalHunting}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Reclutadores Activos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.length}</div>
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* Estadísticas por Reclutador */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Por Reclutador</h3>
              {stats.map((recruiter) => (
                <Card key={recruiter.id} className="p-4">
                  <div className="space-y-4">
                    {/* Header del reclutador */}
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={recruiter.image || undefined}
                          alt={recruiter.name}
                        />
                        <AvatarFallback className="text-sm font-semibold">
                          {recruiter.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold text-base">
                          {recruiter.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {recruiter.totalVacantes} vacantes asignadas
                        </p>
                      </div>
                    </div>

                    {/* Estadísticas del reclutador */}
                    {recruiter.totalVacantes > 0 ? (
                      <div className="flex flex-wrap gap-3 mt-3">
                        {recruiter.hunting > 0 && (
                          <EstadoChip
                            estado="hunting"
                            count={recruiter.hunting}
                            label="Hunting"
                          />
                        )}
                        {recruiter.quickMeeting > 0 && (
                          <EstadoChip
                            estado="quickMeeting"
                            count={recruiter.quickMeeting}
                            label="Quick Meeting"
                          />
                        )}
                        {recruiter.entrevistas > 0 && (
                          <EstadoChip
                            estado="entrevistas"
                            count={recruiter.entrevistas}
                            label="Entrevistas"
                          />
                        )}
                        {recruiter.prePlacement > 0 && (
                          <EstadoChip
                            estado="prePlacement"
                            count={recruiter.prePlacement}
                            label="Pre-Placement"
                          />
                        )}
                        {recruiter.placement > 0 && (
                          <EstadoChip
                            estado="placement"
                            count={recruiter.placement}
                            label="Placement"
                          />
                        )}
                        {recruiter.canceladas > 0 && (
                          <EstadoChip
                            estado="canceladas"
                            count={recruiter.canceladas}
                            label="Canceladas"
                          />
                        )}
                        {recruiter.perdidas > 0 && (
                          <EstadoChip
                            estado="perdidas"
                            count={recruiter.perdidas}
                            label="Perdidas"
                          />
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-4 text-muted-foreground">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <span className="text-sm">Sin vacantes asignadas</span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {!isLoading && !error && stats.length === 0 && (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Users className="h-5 w-5 mr-2" />
            No se encontraron reclutadores
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
