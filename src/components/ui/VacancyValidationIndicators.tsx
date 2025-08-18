import { CheckCircle, AlertCircle, Users, User } from "lucide-react";
import { VacancyWithRelations } from "@/app/(dashboard)/reclutador/components/ReclutadorColumns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VacancyValidationIndicatorsProps {
  vacancy: VacancyWithRelations;
  size?: "sm" | "md";
}

export function VacancyValidationIndicators({
  vacancy,
  size = "sm",
}: VacancyValidationIndicatorsProps) {
  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";

  const indicators = [];

  // Indicador de checklist validado
  if (vacancy.IsChecklistValidated) {
    indicators.push({
      key: "checklist",
      icon: <CheckCircle className={`${iconSize} text-green-500`} />,
      tooltip: "Checklist validado",
      status: "success",
    });
  } else {
    indicators.push({
      key: "checklist",
      icon: <AlertCircle className={`${iconSize} text-yellow-500`} />,
      tooltip: "Checklist pendiente de validación",
      status: "warning",
    });
  }

  // Indicador de terna final
  const ternaCount = vacancy.ternaFinal?.length || 0;
  if (ternaCount > 0) {
    indicators.push({
      key: "terna",
      icon: <Users className={`${iconSize} text-blue-500`} />,
      tooltip: `${ternaCount} candidato${
        ternaCount > 1 ? "s" : ""
      } en terna final`,
      status: "info",
    });
  }

  // Indicador de candidato contratado
  if (vacancy.candidatoContratado) {
    indicators.push({
      key: "contratado",
      icon: <User className={`${iconSize} text-purple-500`} />,
      tooltip: `Candidato contratado: ${vacancy.candidatoContratado.name}`,
      status: "success",
    });
  }

  if (indicators.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="flex items-center space-x-1">
        {indicators.map((indicator) => (
          <Tooltip key={indicator.key}>
            <TooltipTrigger asChild>
              <div className="cursor-help">{indicator.icon}</div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{indicator.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
