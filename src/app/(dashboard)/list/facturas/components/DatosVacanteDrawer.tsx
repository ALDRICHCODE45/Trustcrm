import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export const DatosVacantesDrawer = ({ row }: { row: any }) => {
  const vacanteId = row.original.vacanteId;
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Vacante</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-lg font-semibold text-center">
            Información de la Vacante
          </DrawerTitle>
          <DrawerDescription className="text-sm text-muted-foreground text-center">
            Detalles de la vacante seleccionada.
          </DrawerDescription>
        </DrawerHeader>

        {/* Contenido principal del Drawer */}
        <div className="p-4">
          <Card className="w-full max-w-md mx-auto mb-[30px]">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Vacante #</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Reclutador
                </span>
                <span className="text-sm font-semibold">
                  NOMBRE DEL RECLUTADOS
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Contratado
                </span>
                <span className="text-sm font-semibold">
                  candidato contratado
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Salario
                </span>
                <span className="text-sm font-semibold">
                  salario de la vacante
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Fee (%)
                </span>
                <span className="text-sm font-semibold">
                  fee de la vacante%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
