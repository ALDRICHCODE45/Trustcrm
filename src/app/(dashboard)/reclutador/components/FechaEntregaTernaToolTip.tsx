"use client";

import { useEffect, useState } from "react";
import { ToastCustomMessage } from "@/components/ToastCustomMessage";
import { useCandidates } from "@/hooks/candidates/use-candidates";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { differenceInDays, format } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  vacancyId: string;
}

export const FechaEntregaTernaTooltip = ({ vacancyId }: Props) => {
  const { getFirstTernaDeliveried } = useCandidates(vacancyId);
  const [diasTranscurridos, setDiasTranscurridos] = useState<number | null>(
    null
  );
  const [tooltipContent, setTooltipContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasDeliverTerna, setHasDeliveredTerna] = useState<boolean | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const firstTernaDeliveried = await getFirstTernaDeliveried();

        if (!firstTernaDeliveried) {
          toast.custom((t) => (
            <ToastCustomMessage
              message="Error"
              title="Error al obtener la primera terna entregada"
              type="error"
              onClick={() => {
                toast.dismiss(t);
              }}
            />
          ));
          setIsLoading(false);
          return;
        }

        const ternaEntregada = firstTernaDeliveried.ternaHistory.at(0);
        const fechaAsignacion = firstTernaDeliveried.fechaAsignacion;

        // Si no hay fecha de asignación, no podemos calcular días
        if (!fechaAsignacion) {
          setIsLoading(false);
          setHasDeliveredTerna(false);
          return;
        }

        // Calcular días transcurridos
        let dias: number;
        let tooltip: string;

        if (ternaEntregada?.deliveredAt) {
          // Si existe la terna entregada, calcular días entre asignación y entrega
          // Sumamos 1 para incluir el día de asignación en el conteo
          dias =
            differenceInDays(
              new Date(ternaEntregada.deliveredAt),
              new Date(fechaAsignacion)
            ) + 1;
          setHasDeliveredTerna(true);
          tooltip = format(
            new Date(ternaEntregada.deliveredAt),
            "EEE d/M/yy HH:mm",
            {
              locale: es,
            }
          );
        } else {
          // Si no existe la terna, calcular días desde asignación hasta hoy
          // Sumamos 1 para incluir el día de asignación en el conteo
          dias = differenceInDays(new Date(), new Date(fechaAsignacion)) + 1;
          tooltip = "Terna no entregada";
        }

        setDiasTranscurridos(dias);
        setTooltipContent(tooltip);
      } catch (error) {
        console.error("Error al obtener terna:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [getFirstTernaDeliveried]);

  if (isLoading) {
    return (
      <Button variant="outline" className="w-full" disabled>
        Cargando...
      </Button>
    );
  }

  if (diasTranscurridos === null) {
    return <span>N/A</span>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={`${hasDeliverTerna ? "outline" : "destructive"}`}
          className="w-full"
        >
          {diasTranscurridos} {diasTranscurridos === 1 ? "día" : "días"}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltipContent}</p>
      </TooltipContent>
    </Tooltip>
  );
};
