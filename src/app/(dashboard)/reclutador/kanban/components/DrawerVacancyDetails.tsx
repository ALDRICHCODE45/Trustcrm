import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerFooter,
  DrawerDescription,
  DrawerTitle,
  DrawerHeader,
  DrawerContent,
  DrawerTrigger,
  DrawerOverlay,
  DrawerPortal,
} from "@/components/ui/drawer";
import { VacancyWithRelations } from "../../components/ReclutadorColumns";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ListCollapse, ReceiptText } from "lucide-react";

export const DrawerVacancyDetails = ({
  vacante,
}: {
  vacante: VacancyWithRelations;
}) => {
  const details = [
    { label: "Prestaciones", value: vacante.prestaciones },
    { label: "Herramientas de trabajo", value: vacante.herramientas },
    { label: "Comisiones/Bonos", value: vacante.comisiones },
    { label: "Modalidad", value: vacante.modalidad },
    { label: "Horario", value: vacante.horario },
    { label: "Comentarios", value: vacante.comentarios },
  ];

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm">
          <ListCollapse />
          Ver detalles
        </Button>
      </DrawerTrigger>
      <DrawerPortal>
        <DrawerOverlay className="z-[9998]" />
        <DrawerContent className="z-[9999] max-h-[60vh]">
          <div className="mx-auto w-full max-w-4xl flex flex-col h-full">
            <DrawerHeader className="pb-4 flex-shrink-0">
              <DrawerTitle className="text-xl">
                Detalles de la Vacante
              </DrawerTitle>
              <DrawerDescription>
                Información adicional sobre la posición
              </DrawerDescription>
            </DrawerHeader>

            <ScrollArea className="flex-1 px-6">
              <div className="space-y-4 pb-6 max-h-[300px] overflow-y-auto">
                {details.map((detail, index) => (
                  <div key={detail.label}>
                    <div className="flex items-start justify-between py-3">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                          {detail.label}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          {detail.value || (
                            <span className="italic text-gray-400">
                              No especificado
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    {index < details.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </ScrollArea>

            <DrawerFooter className="pt-4 flex-shrink-0">
              <div className="flex justify-end">
                <DrawerTrigger asChild>
                  <Button variant="outline" size="sm">
                    Cerrar
                  </Button>
                </DrawerTrigger>
              </div>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </DrawerPortal>
    </Drawer>
  );
};
