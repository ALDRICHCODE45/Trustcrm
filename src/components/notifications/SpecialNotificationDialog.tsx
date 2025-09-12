"use client";

import React, { useEffect, useState } from "react";
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
import { AlertTriangle, CheckCircle, X, Loader2, BellRing } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { SpecialNotificationWithRelations } from "@/hooks/useSpecialNotifications";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { VacanteTabs } from "@/app/(dashboard)/reclutador/components/kanbanReclutadorBoard";
import { Role } from "@prisma/client";
import { VacancyWithRelations } from "@/app/(dashboard)/reclutador/components/ReclutadorColumns";
import { useUsers } from "@/hooks/users/use-users";

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
  const [vacancyIsOpen, setVacancyIsOpen] = useState(false);
  const { fetchLoggedUser, loggedUser } = useUsers();

  useEffect(() => {
    fetchLoggedUser();
  }, [fetchLoggedUser]);

  const handleAccept = async () => {
    if (!notification) return;
    await onMarkAsShown(notification.id);
    onClose();
  };

  if (!notification) {
    return null;
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[650px] z-[9999] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                    <BellRing className="h-6 w-6" />
                    {notification.title}
                  </DialogTitle>
                </div>
              </div>
            </div>
          </DialogHeader>

          {notification.type === "VACANCY_ASSIGNED" && (
            <Card>
              <CardHeader>{notification.message}</CardHeader>
            </Card>
          )}

          {/* Mensaje destacado sobre documentos requeridos */}
          {notification.type === "VACANCY_ASSIGNED" && (
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
                      <span className="underline font-bold">OBLIGATORIO</span>{" "}
                      que entregues los siguientes documentos:
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
                        ⚠️ Sin estos documentos NO podrás proceder con el
                        proceso de reclutamiento.
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
          )}

          {notification.type === "URGENT_TASK_ASSIGNED" &&
            notification.vacancy && (
              <>
                <Card>
                  <CardContent className="p-4">
                    <p>{notification.message}</p>
                  </CardContent>
                </Card>

                <Button
                  className="mt-3 w-full"
                  variant="outline"
                  onClick={() => {
                    setVacancyIsOpen(true);
                  }}
                >
                  Ver vacante
                </Button>
              </>
            )}

          <Separator />

          {/* Acciones */}
          <div className="w-full flex justify-center">
            <Button
              onClick={handleAccept}
              disabled={isUpdating}
              className="w-full font-semibold py-3"
              size="lg"
              variant="outline"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Enterado
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {vacancyIsOpen && loggedUser && (
        <Dialog open={vacancyIsOpen} onOpenChange={setVacancyIsOpen}>
          <DialogContent className="sm:max-w-[730px] max-h-[90vh] overflow-y-auto z-[99999]">
            <DialogHeader className="">
              <DialogTitle>
                {notification.vacancy?.posicion || "Vacante"}
              </DialogTitle>
            </DialogHeader>
            <VacanteTabs
              vacante={notification.vacancy as VacancyWithRelations}
              user_logged={{
                email: loggedUser.email,
                name: loggedUser.name,
                role: loggedUser.role,
                image: loggedUser.image || "",
                id: loggedUser.id,
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
