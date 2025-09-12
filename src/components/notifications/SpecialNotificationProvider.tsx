"use client";

import React, { useEffect, useState } from "react";
import { useSpecialNotifications } from "@/hooks/useSpecialNotifications";
import { SpecialNotificationDialog } from "./SpecialNotificationDialog";

interface SpecialNotificationProviderProps {
  userId: string;
  children: React.ReactNode;
}

export const SpecialNotificationProvider = ({
  userId,
  children,
}: SpecialNotificationProviderProps) => {
  const {
    currentNotification,
    isUpdating,
    markAsShown,
    dismissNotification,
    showNextNotification,
  } = useSpecialNotifications(userId);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Mostrar dialog automáticamente cuando hay notificaciones pendientes
  useEffect(() => {
    if (currentNotification && !isDialogOpen) {
      setIsDialogOpen(true);
    }
  }, [currentNotification, isDialogOpen]);

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleMarkAsShown = async (notificationId: string) => {
    await markAsShown(notificationId);
    // Cuando se marca como vista, la notificación se remueve del array
    // y automáticamente la siguiente notificación toma su lugar en el mismo índice
    // Por eso NO necesitamos llamar showNextNotification()
    handleCloseDialog();
  };

  const handleDismiss = async (notificationId: string) => {
    await dismissNotification(notificationId);
    handleCloseDialog();
  };

  return (
    <>
      {children}
      <SpecialNotificationDialog
        notification={currentNotification}
        isOpen={isDialogOpen && !!currentNotification}
        onClose={handleCloseDialog}
        onMarkAsShown={handleMarkAsShown}
        onDismiss={handleDismiss}
        isUpdating={isUpdating}
      />
    </>
  );
};
