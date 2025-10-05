"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Bell, Check, Clock, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

interface NotificationListProps {
  notifications: Notification[];
  markAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
}

interface NotificationItemProps {
  notification: Notification;
  markAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
}
export const Announcments: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Nuevo mensaje",
      description: "You have a new message from John Doe",
      time: "5 minutes ago",
      read: false,
    },
    {
      id: "2",
      title: "Solicitud de amistad",
      description: "Jane Smith sent you a friend request",
      time: "Hace una hora",
      read: false,
    },
    {
      id: "3",
      title: "Actualizar el sistema",
      description: "Your system has been updated successfully",
      time: "hace 2 dias",
      read: true,
    },
    {
      id: "4",
      title: "Reunión programada",
      description: "Reunión con el equipo de desarrollo a las 3pm",
      time: "ayer",
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(
      notifications.filter((notification) => notification.id !== id)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <Card className=" shadow-sm overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Notificaciones</CardTitle>
            {unreadCount > 0 && (
              <Badge
                variant="secondary"
                className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200"
              >
                {unreadCount} nueva{unreadCount !== 1 && "s"}
              </Badge>
            )}
          </div>
          <div className="relative">
            <Bell className="h-4 w-4 " />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-500" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="all" className="w-full">
          <div className="border-b">
            <TabsList className="w-full justify-start h-10 bg-transparent p-0">
              <TabsTrigger
                value="all"
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none h-10 data-[state=active]:shadow-none px-4 text-sm"
              >
                Todas
              </TabsTrigger>
              <TabsTrigger
                value="unread"
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none h-10 data-[state=active]:shadow-none px-4 text-sm"
              >
                No leídas {unreadCount > 0 && `(${unreadCount})`}
              </TabsTrigger>
              <TabsTrigger
                value="read"
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none h-10 data-[state=active]:shadow-none px-4 text-sm"
              >
                Leídas
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="all" className="m-0">
            <NotificationList
              notifications={notifications}
              markAsRead={markAsRead}
              deleteNotification={deleteNotification}
            />
          </TabsContent>
          <TabsContent value="unread" className="m-0">
            <NotificationList
              notifications={notifications.filter((n) => !n.read)}
              markAsRead={markAsRead}
              deleteNotification={deleteNotification}
            />
          </TabsContent>
          <TabsContent value="read" className="m-0">
            <NotificationList
              notifications={notifications.filter((n) => n.read)}
              markAsRead={markAsRead}
              deleteNotification={deleteNotification}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex items-center justify-between px-3 py-1 border-t mt-20">
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-8"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
        >
          <Check className="h-3 w-3 mr-1" /> Marcar leído
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-8"
          onClick={clearAllNotifications}
          disabled={notifications.length === 0}
        >
          <Trash2 className="h-3 w-3 mr-1" /> Limpiar todo
        </Button>
      </CardFooter>
    </Card>
  );
};

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  markAsRead,
  deleteNotification,
}) => {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 p-6 text-center">
        <Bell className="h-8 w-8 text-slate-300 mb-3" />
        <p className="text-sm text-slate-500 font-medium">
          No hay notificaciones
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Las notificaciones aparecerán aquí
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-48 w-full">
      <div className="p-2">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            markAsRead={markAsRead}
            deleteNotification={deleteNotification}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  markAsRead,
  deleteNotification,
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  return (
    <div
      className={cn(
        "relative flex items-start space-x-3 rounded-lg p-2 transition-all mb-2",
        {
          "": !notification.read,
          "bg-transparent": notification.read,
        }
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!notification.read && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-md" />
      )}

      <div className="flex-1 space-y-1 min-w-0 pl-1">
        <div className="flex items-center justify-between">
          <p
            className={cn(
              "text-sm leading-none",
              !notification.read && "font-medium"
            )}
          >
            {notification.title}
          </p>
          <div className="flex items-center text-xs text-slate-500 whitespace-nowrap ml-2">
            <Clock className="h-3 w-3 mr-1 inline-flex" />
            {notification.time}
          </div>
        </div>
        <p className="text-xs text-slate-500 line-clamp-2">
          {notification.description}
        </p>
      </div>

      <TooltipProvider delayDuration={300}>
        <div
          className={cn(
            "flex space-x-1 transition-opacity",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        >
          {!notification.read && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full"
                  onClick={() => markAsRead(notification.id)}
                >
                  <Check className="h-3 w-3" />
                  <span className="sr-only">Marcar como leído</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">Marcar como leído</p>
              </TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50"
                onClick={() => deleteNotification(notification.id)}
              >
                <Trash2 className="h-3 w-3" />
                <span className="sr-only">Eliminar</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">Eliminar notificación</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
};
