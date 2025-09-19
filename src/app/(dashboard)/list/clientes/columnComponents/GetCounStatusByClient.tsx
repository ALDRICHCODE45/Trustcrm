"use client";
import {
  getClientAsignadas,
  getClientCanceladas,
  getClientEnPerdidas,
  getClientEnPlacement,
} from "@/actions/clientes/stats";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VacancyEstado } from "@prisma/client";
import { ArrowDownToLine, CircleCheck, CircleOff, Loader2 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";

interface Props {
  clientId: string;
  status?: VacancyEstado;
}

const getStatusIcon = (status?: VacancyEstado) => {
  if (status === VacancyEstado.Perdida) {
    return <ArrowDownToLine size={15} className="text-red-500" />;
  } else if (status === VacancyEstado.Cancelada) {
    return <CircleOff size={15} className="text-red-500" />;
  } else if (status === VacancyEstado.Placement) {
    return <CircleCheck size={15} className="text-green-500" />;
  } else {
    return <CircleCheck size={15} className="text-gray-500" />;
  }
};

export const GetCounStatusByClient = ({ clientId, status }: Props) => {
  const [statusCount, setStatusCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatusCount = useCallback(async () => {
    try {
      setIsLoading(true);

      if (!status) {
        const { ok, data } = await getClientAsignadas(clientId);
        if (!ok) {
          setStatusCount(0);
          return;
        }
        setStatusCount(data!);
      } else if (status === VacancyEstado.Perdida) {
        const { ok, data } = await getClientEnPerdidas(clientId);
        if (!ok) {
          setStatusCount(0);
          return;
        }
        setStatusCount(data!);
      } else if (status === VacancyEstado.Cancelada) {
        const { ok, data } = await getClientCanceladas(clientId);
        if (!ok) {
          setStatusCount(0);
          return;
        }
        setStatusCount(data!);
      } else if (status === VacancyEstado.Placement) {
        const { ok, data } = await getClientEnPlacement(clientId);
        if (!ok) {
          setStatusCount(0);
          return;
        }
        setStatusCount(data!);
      }
    } catch (error) {
      console.error("Error fetching status count:", error);
      setStatusCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [clientId, status]);

  useEffect(() => {
    if (clientId) {
      fetchStatusCount();
    }
  }, [clientId, status, fetchStatusCount]);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">
            <p className="flex gap-1 items-center">
              {getStatusIcon(status)}
              {isLoading ? <Loader2 className="animate-spin" /> : statusCount}
            </p>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Vacantes {status}</p>
        </TooltipContent>
      </Tooltip>
    </>
  );
};
