import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Building, Calendar, Clock } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { VacancyWithRelations } from "./ReclutadorColumns";
import { format } from "date-fns";

interface VacanteCardProps {
  vacante: VacancyWithRelations;
  onClick: () => void;
}
const getTipoColor = (tipo: string) => {
  switch (tipo) {
    case "Nueva":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "Garantia":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
};
export const VacanteCard: React.FC<VacanteCardProps> = ({
  vacante,
  onClick,
}) => (
  <Card
    className="mb-3 cursor-pointer hover:shadow-md transition-shadow"
    onClick={onClick}
  >
    <CardHeader className="p-4 pb-2">
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-base">{vacante.posicion}</h3>
      </div>
      <div className="flex items-center text-sm text-muted-foreground mt-1">
        <Building className="h-3.5 w-3.5 mr-1" />
        <span>{vacante.cliente.cuenta}</span>
      </div>
    </CardHeader>
    <CardContent className="p-4 pt-0 pb-2">
      <div className="flex items-center text-sm mt-2">
        <Avatar className="h-6 w-6 mr-2">
          <AvatarImage
            src={vacante.reclutador.image ?? ""}
            alt={vacante.reclutador.name}
            className="h-full w-full object-cover"
          />
          <AvatarFallback>{vacante.reclutador.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className="text-sm">{vacante.reclutador.name}</span>
      </div>
      <div className="flex items-center text-sm mt-2">
        <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
        <span className="text-muted-foreground">
          Entrega:
          {vacante.fechaEntrega && format(vacante.fechaEntrega, "mm/dd/yyy")}
        </span>
      </div>
    </CardContent>
    <CardFooter className="p-4 pt-2 flex justify-between">
      <Badge variant="outline" className={getTipoColor(vacante.tipo)}>
        {vacante.tipo}
      </Badge>
      <div className="flex items-center text-sm text-muted-foreground">
        <Clock className="h-3.5 w-3.5 mr-1" />
        <span>{vacante.tiempoTranscurrido} días</span>
      </div>
    </CardFooter>
  </Card>
);
