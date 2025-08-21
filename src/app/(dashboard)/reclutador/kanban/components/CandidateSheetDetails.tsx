import { PersonWithRelations } from "@/app/(dashboard)/list/reclutamiento/components/FinalTernaSheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { FileUser } from "lucide-react";

export const CandidateSheetDetails = ({
  candidate,
}: {
  candidate: PersonWithRelations;
}) => {
  return (
    <Sheet>
      <SheetTrigger asChild className="mt-4">
        <Button variant="outline" size="sm">
          <FileUser className="h-4 w-4 mr-2" />
          Detalles
        </Button>
      </SheetTrigger>

      <SheetContent className="min-w-[27vw] z-[9999]">
        <ScrollArea className="h-full pr-4">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-lg">{candidate.name}</SheetTitle>
            <SheetDescription>
              Información detallada del candidato
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4">
            {/* Estado de empleo */}
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-sm font-medium">Estado actual</span>
              <Badge
                variant={candidate.esta_empleado ? "default" : "secondary"}
                className="text-xs"
              >
                {candidate.esta_empleado ? "Empleado" : "No empleado"}
              </Badge>
            </div>

            {/* Información económica */}
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-sm font-medium">Sueldo actual/último</span>
              <Badge variant="outline" className="text-xs font-normal">
                {candidate.sueldo_actual_o_ultimo || "No especificado"}
              </Badge>
            </div>

            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-sm font-medium">Expectativa económica</span>
              <Badge variant="outline" className="text-xs font-normal">
                {candidate.expectativa_económica || "No especificado"}
              </Badge>
            </div>

            {/* Prestaciones y beneficios */}
            <div className="flex justify-between items-start py-3 border-b">
              <span className="text-sm font-medium">
                Prestaciones actuales/últimas
              </span>
              <Badge
                variant="outline"
                className="text-xs font-normal max-w-[180px] text-right"
              >
                {candidate.prestaciones_actuales_o_ultimas || "No especificado"}
              </Badge>
            </div>

            <div className="flex justify-between items-start py-4 border-b">
              <span className="text-sm font-medium">
                Empresa actual o última
              </span>
              <Badge
                variant="outline"
                className="text-xs font-normal max-w-[180px] text-right"
              >
                {candidate.empresa_actual_o_ultima || "No especificado"}
              </Badge>
            </div>

            <div className="flex justify-between items-start py-3 border-b">
              <span className="text-sm font-medium">Bonos y comisiones</span>
              <Badge
                variant="outline"
                className="text-xs font-normal max-w-[180px] text-right"
              >
                {candidate.bonos_comisiones || "No especificado"}
              </Badge>
            </div>

            <div className="flex justify-between items-start py-3 border-b">
              <span className="text-sm font-medium">Otros beneficios</span>
              <Badge
                variant="outline"
                className="text-xs font-normal max-w-[180px] text-right"
              >
                {candidate.otros_beneficios || "No especificado"}
              </Badge>
            </div>

            {/* Ubicación y modalidad */}
            <div className="flex justify-between items-start py-3 border-b">
              <span className="text-sm font-medium">
                Dirección del candidato
              </span>
              <Badge
                variant="outline"
                className="text-xs font-normal max-w-[180px] text-right"
              >
                {candidate.direccion_actual || "No especificado"}
              </Badge>
            </div>

            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-sm font-medium">
                Modalidad actual/última
              </span>
              <Badge variant="outline" className="text-xs font-normal">
                {candidate.modalidad_actual_o_ultima || "No especificado"}
              </Badge>
            </div>

            <div className="flex justify-between items-start py-3 border-b">
              <span className="text-sm font-medium">
                Ubicación último trabajo
              </span>
              <Badge
                variant="outline"
                className="text-xs font-normal max-w-[180px] text-right"
              >
                {candidate.ubicacion_ultimo_trabajo || "No especificado"}
              </Badge>
            </div>

            {/* Información de contacto */}
            {candidate.email && (
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-sm font-medium">Email</span>
                <Badge variant="outline" className="text-xs font-normal">
                  {candidate.email}
                </Badge>
              </div>
            )}

            {candidate.phone && (
              <div className="flex justify-between items-center py-3">
                <span className="text-sm font-medium">Teléfono</span>
                <Badge variant="outline" className="text-xs font-normal">
                  {candidate.phone}
                </Badge>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
