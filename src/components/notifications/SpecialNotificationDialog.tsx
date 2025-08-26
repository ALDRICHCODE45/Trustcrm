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
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertTriangle, CheckCircle, X, Loader2 } from "lucide-react";
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

  if (!notification) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] z-[9999] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {getPriorityIcon(notification.priority)}
                <DialogTitle className="text-2xl font-bold text-primary">
                  🚀 {notification.title}
                </DialogTitle>
              </div>
            </div>
          </div>
          <DialogDescription className="text-lg font-medium text-foreground mt-2">
            {notification.message}
          </DialogDescription>
        </DialogHeader>

        {/* Mensaje destacado sobre documentos requeridos */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-4 my-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                📋 Documentos Requeridos para Continuar
              </h4>
              <div className="space-y-2 text-sm text-orange-800 dark:text-orange-200">
                <p className="font-medium">
                  Para poder avanzar con esta vacante, es{" "}
                  <span className="underline font-bold">OBLIGATORIO</span> que
                  entregues los siguientes documentos:
                </p>
                <ul className="list-none space-y-1 ml-4">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    <span className="font-medium">
                      Checklist de requisitos
                    </span>{" "}
                    - Define los criterios de selección
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    <span className="font-medium">Perfil muestra</span> -
                    Ejemplo del candidato ideal
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    <span className="font-medium">Job Description</span> -
                    Descripción detallada del puesto
                  </li>
                </ul>
                <div className="mt-3 p-3 bg-orange-100 dark:bg-orange-900/50 rounded-md border-l-4 border-orange-500">
                  <p className="font-semibold text-orange-900 dark:text-orange-100">
                    ⚠️ Sin estos documentos NO podrás proceder con el proceso de
                    reclutamiento.
                  </p>
                  <p className="text-xs mt-1 text-orange-700 dark:text-orange-300">
                    Entrega estos documentos lo antes posible para evitar
                    retrasos en la vacante.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

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

        <Separator />

        {/* Acciones */}
        <div className="w-full flex justify-center">
          <Button
            onClick={handleAccept}
            disabled={isUpdating}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
            size="lg"
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                ¡Entendido! Entregaré los documentos
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
