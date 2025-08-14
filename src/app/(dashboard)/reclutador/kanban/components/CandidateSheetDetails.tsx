import { PersonWithRelations } from "@/app/(dashboard)/list/reclutamiento/components/FinalTernaSheet";
import { Button } from "@/components/ui/button";
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

      <SheetContent>
        <SheetHeader>
          <SheetTitle>Detalles del candidato</SheetTitle>
          <SheetDescription>
            Campos de información adicionales del candidato.
          </SheetDescription>
          <div className="flex flex-col gap-4">
            <div className="flex  justify-between w-full">
              <p>¿Actualmente empleado?</p>
              <p>{candidate.esta_empleado ? "Sí" : "No"}</p>
            </div>
            <div className="flex  justify-between w-full">
              <p>Sueldo actual o último</p>
              <p>{candidate.sueldo_actual_o_ultimo || "No Especificado"}</p>
            </div>
            <div className="flex  justify-between w-full">
              <p>Prestaciones actuales o últimas</p>
              <p>
                {candidate.prestaciones_actuales_o_ultimas || "No Especificado"}
              </p>
            </div>
            <div className="flex  justify-between w-full">
              <p>Bonos y comisiones</p>
              <p>{candidate.bonos_comisiones || "No Especificado"}</p>
            </div>
            <div className="flex  justify-between w-full">
              <p>Otros beneficios</p>
              <p>{candidate.otros_beneficios || "No Especificado"}</p>
            </div>
            <div className="flex  justify-between w-full">
              <p>Expectativa económica</p>
              <p>{candidate.expectativa_económica || "No Especificado"}</p>
            </div>
            <div className="flex  justify-between w-full">
              <p>Dirección actual</p>
              <p>{candidate.direccion_actual || "No Especificado"}</p>
            </div>
            <div className="flex  justify-between w-full">
              <p>Modalidad actual o última</p>
              <p>{candidate.modalidad_actual_o_ultima || "No Especificado"}</p>
            </div>
            <div className="flex  justify-between w-full">
              <p>Ubicación último trabajo</p>
              <p>{candidate.ubicacion_ultimo_trabajo || "No Especificado"}</p>
            </div>
          </div>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};
