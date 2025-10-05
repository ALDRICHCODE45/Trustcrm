"use client";

import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { User } from "@prisma/client";
import { useState } from "react";

interface NotificationSettingsProps {
  users: User[];
  onNotificationChange: (enabled: boolean, recipients: string[]) => void;
}

export function NotificationSettings({
  users,
  onNotificationChange,
}: NotificationSettingsProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const handleSwitchChange = (checked: boolean) => {
    setNotificationsEnabled(checked);
    onNotificationChange(checked, selectedUsers);
  };

  const handleUserSelect = (value: string) => {
    const newSelectedUsers = selectedUsers.includes(value)
      ? selectedUsers.filter((id) => id !== value)
      : [...selectedUsers, value];

    setSelectedUsers(newSelectedUsers);
    onNotificationChange(notificationsEnabled, newSelectedUsers);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="notifications"
          checked={notificationsEnabled}
          onCheckedChange={handleSwitchChange}
        />
        <Label htmlFor="notifications">Notificar al completar la tarea</Label>
      </div>

      {notificationsEnabled && (
        <div className="space-y-2">
          <Label>Seleccionar destinatarios</Label>
          <Select onValueChange={handleUserSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar usuarios" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedUsers.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {selectedUsers.length} usuario(s) seleccionado(s)
            </div>
          )}
        </div>
      )}
    </div>
  );
}
