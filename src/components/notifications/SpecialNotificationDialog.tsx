"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CalendarDays,
  Building2,
  DollarSign,
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  CheckCircle,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { SpecialNotificationWithRelations } from "@/hooks/useSpecialNotifications";

interface SpecialNotificationDialogProps {
  notification: SpecialNotificationWithRelations | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsShown: (notificationId: string) => Promise<void>;
  onDismiss: (notificationId: string) => Promise<void>;
  isUpdating: boolean;
}

export const SpecialNotificationDialog = ({
  notification,
  isOpen,
  onClose,
  onMarkAsShown,
  onDismiss,
  isUpdating,
}: SpecialNotificationDialogProps) => {
  if (!notification) return null;

  const handleAccept = async () => {
    await onMarkAsShown(notification.id);
    onClose();
  };

  const handleDismiss = async () => {
    await onDismiss(notification.id);
    onClose();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-500 text-white";
      case "HIGH":
        return "bg-orange-500 text-white";
      case "MEDIUM":
        return "bg-blue-500 text-white";
      case "LOW":
        return "bg-gray-500 text-white";
      default:
        return "bg-blue-500 text-white";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "URGENT":
      case "HIGH":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const renderVacancyDetails = () => {
    if (!notification.vacancy) return null;

    const { vacancy } = notification;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Detalles de la Vacante
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Posición:</span>
                <span className="text-sm">{vacancy.posicion}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Cliente:</span>
                <span className="text-sm">{vacancy.cliente.cuenta}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Prioridad:</span>
                <Badge
                  variant={
                    vacancy.prioridad === "Alta" ? "destructive" : "secondary"
                  }
                >
                  {vacancy.prioridad}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              {vacancy.fechaEntrega && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Fecha Entrega:</span>
                  <span className="text-sm">
                    {format(new Date(vacancy.fechaEntrega), "dd/MM/yyyy", {
                      locale: es,
                    })}
                  </span>
                </div>
              )}
              {notification.metadata?.salario && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Salario:</span>
                  <span className="text-sm">
                    ${notification.metadata.salario.toLocaleString("es-MX")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] z-[9999]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {getPriorityIcon(notification.priority)}
                <DialogTitle className="text-xl font-bold">
                  {notification.title}
                </DialogTitle>
              </div>
              <Badge className={getPriorityColor(notification.priority)}>
                {notification.priority}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="text-base">
            {notification.message}
          </DialogDescription>
        </DialogHeader>

        <Separator />

        {/* Información del remitente */}
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
          <Avatar className="h-10 w-10">
            <AvatarImage src={notification.recipient.image || ""} />
            <AvatarFallback>
              {notification.recipient.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">Asignado a:</p>
            <p className="text-sm text-muted-foreground">
              {notification.recipient.name}
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-muted-foreground">
              {format(
                new Date(notification.createdAt),
                "dd/MM/yyyy 'a las' HH:mm",
                {
                  locale: es,
                }
              )}
            </p>
          </div>
        </div>

        {/* Detalles específicos según el tipo */}
        {notification.type === "VACANCY_ASSIGNED" && renderVacancyDetails()}

        <Separator />

        {/* Acciones */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleAccept}
            disabled={isUpdating}
            className="flex-1"
          >
            {isUpdating ? "Procesando..." : "Entendido"}
          </Button>
          <Button
            variant="outline"
            onClick={handleDismiss}
            disabled={isUpdating}
            className="flex-1"
          >
            {isUpdating ? "Procesando..." : "Descartar"}
          </Button>
        </div>

        {/* Información adicional */}
        <div className="text-xs text-muted-foreground text-center">
          Esta notificación se marcará automáticamente como procesada
        </div>
      </DialogContent>
    </Dialog>
  );
};
