import { PersonWithRelations } from "@/app/(dashboard)/list/reclutamiento/components/FinalTernaSheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
        <Button variant="outline">
          <FileUser className="h-4 w-4" />
          Detalles
        </Button>
      </SheetTrigger>

      <SheetContent className="min-w-[25vw] z-[9999]">
        <SheetHeader>
          <SheetTitle>{candidate.name}</SheetTitle>
          <SheetDescription>Detalles del candidate</SheetDescription>
          <Separator orientation="horizontal" className="my-4" />
          <div className="flex flex-col gap-4">
            <div className="flex  justify-between w-full">
              <p className="font-bold text-sm">¿Actualmente empleado?</p>
              <Badge variant="outline" className="text-sm font-normal">
                {candidate.esta_empleado ? "Sí" : "No"}
              </Badge>
            </div>
            <div className="flex  justify-between w-full">
              <p className="font-bold text-sm">Sueldo actual o último</p>
              <Badge variant="outline" className="text-sm font-normal">
                {candidate.sueldo_actual_o_ultimo || "No Especificado"}
              </Badge>
            </div>
            <div className="flex  justify-between w-full">
              <p className="font-bold text-sm">
                Prestaciones actuales o últimas
              </p>
              <Badge variant="outline" className="text-sm font-normal">
                {candidate.prestaciones_actuales_o_ultimas || "No Especificado"}
              </Badge>
            </div>
            <div className="flex  justify-between w-full">
              <p className="font-bold text-sm">Bonos y comisiones</p>
              <Badge variant="outline" className="text-sm font-normal">
                {candidate.bonos_comisiones || "No Especificado"}
              </Badge>
            </div>
            <div className="flex  justify-between w-full">
              <p className="font-bold text-sm">Otros beneficios</p>
              <Badge variant="outline" className="text-sm font-normal">
                {candidate.otros_beneficios || "No Especificado"}
              </Badge>
            </div>
            <div className="flex  justify-between w-full">
              <p className="font-bold text-sm">Expectativa económica</p>
              <Badge variant="outline" className="text-sm font-normal">
                {candidate.expectativa_económica || "No Especificado"}
              </Badge>
            </div>
            <div className="flex  justify-between w-full">
              <p className="font-bold text-sm">Dirección actual</p>
              <Badge variant="outline" className="text-sm font-normal">
                {candidate.direccion_actual || "No Especificado"}
              </Badge>
            </div>
            <div className="flex  justify-between w-full">
              <p className="font-bold text-sm">Modalidad actual o última</p>
              <Badge variant="outline" className="text-sm font-normal">
                {candidate.modalidad_actual_o_ultima || "No Especificado"}
              </Badge>
            </div>
            <div className="flex  justify-between w-full">
              <p className="font-bold text-sm">Ubicación último trabajo</p>
              <Badge variant="outline" className="text-sm font-normal">
                {candidate.ubicacion_ultimo_trabajo || "No Especificado"}
              </Badge>
            </div>
          </div>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};
