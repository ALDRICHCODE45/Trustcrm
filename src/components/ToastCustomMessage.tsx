import { Button } from "@/components/ui/button";
import {
  CircleCheckIcon,
  XIcon,
  AlertCircleIcon,
  InfoIcon,
} from "lucide-react";

export const ToastCustomMessage = ({
  title,
  message,
  type,
  onClick,
}: {
  title: string;
  message: string;
  type: "success" | "error" | "info";
  onClick: () => void;
}) => {
  // Función para obtener el icono según el tipo
  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <CircleCheckIcon
            className="mt-0.5 shrink-0 text-emerald-500"
            size={16}
            aria-hidden="true"
          />
        );
      case "error":
        return (
          <AlertCircleIcon
            className="mt-0.5 shrink-0 text-red-500"
            size={16}
            aria-hidden="true"
          />
        );
      case "info":
        return (
          <InfoIcon
            className="mt-0.5 shrink-0 text-blue-500"
            size={16}
            aria-hidden="true"
          />
        );
      default:
        return (
          <CircleCheckIcon
            className="mt-0.5 shrink-0 text-emerald-500"
            size={16}
            aria-hidden="true"
          />
        );
    }
  };

  return (
    <div className="bg-background max-w-[400px] rounded-md border p-4 shadow-lg">
      <div className="flex gap-2">
        <div className="flex grow gap-3">
          {getIcon()}
          <div className="flex grow flex-col gap-3">
            <div className="space-y-1">
              <p className="text-sm font-medium">{title}</p>
              <p className="text-muted-foreground text-sm">{message}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent"
            aria-label="Cerrar notificación"
            onClick={onClick}
          >
            <XIcon
              size={16}
              className="opacity-60 transition-opacity group-hover:opacity-100"
              aria-hidden="true"
            />
          </Button>
        </div>
      </div>
    </div>
  );
};
