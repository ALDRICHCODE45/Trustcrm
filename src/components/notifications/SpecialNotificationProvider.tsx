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
    console.log("Provider useEffect - checking notification", {
      hasCurrentNotification: !!currentNotification,
      isDialogOpen,
      notificationId: currentNotification?.id,
    });

    if (currentNotification && !isDialogOpen) {
      console.log(
        "Provider: Opening dialog for notification",
        currentNotification.id
      );
      setIsDialogOpen(true);
    }
  }, [currentNotification, isDialogOpen]);

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    // Mostrar la siguiente notificación después de un breve delay
    setTimeout(() => {
      showNextNotification();
    }, 500);
  };

  const handleMarkAsShown = async (notificationId: string) => {
    await markAsShown(notificationId);
    handleCloseDialog();
  };

  const handleDismiss = async (notificationId: string) => {
    await dismissNotification(notificationId);
    handleCloseDialog();
  };

  console.log("currentNotification SpecialNotificationProvider", {
    currentNotification,
    isDialogOpen,
    hasNotification: !!currentNotification,
    shouldShowDialog: isDialogOpen && !!currentNotification,
  });

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
