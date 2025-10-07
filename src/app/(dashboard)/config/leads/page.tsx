import prisma from "@/core/lib/db";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrigenesSections } from "./components/OrigenesSection";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateSubSectorForm } from "./components/CreateSubSectorForm";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Construction } from "lucide-react";

const getAllOrigenes = async () => {
  try {
    const origenes = await prisma.leadOrigen.findMany();
    return origenes;
  } catch (err) {
    throw new Error("Error al cargar origenes");
  }
};

const getAllSectores = async () => {
  try {
    const sectores = await prisma.sector.findMany();
    return sectores;
  } catch (err) {
    throw new Error("Error al cargar sectores");
  }
};

const LeadsPage = async () => {
  const origenes = await getAllOrigenes();
  const sectores = await getAllSectores();

  return (
    <div className="space-y-6">
      {/* Header simple */}
      <div>
        <div className="">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Configuración de Leads
            </h2>
            <p className="text-sm text-muted-foreground">
              Gestiona los orígenes y sectores de tus leads
            </p>
          </div>
        </div>
      </div>

      {/* Tabs minimalistas */}
      <Tabs defaultValue="origenes" className="space-y-6">
        <TabsList>
          <TabsTrigger value="origenes" className="">
            Orígenes
            <Badge variant="secondary" className="text-xs">
              {origenes.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="sectores" className="">
            Sectores
            <Badge variant="secondary" className="text-xs">
              {sectores.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="origenes" className="space-y-6">
          <OrigenesSections origenes={origenes} />
        </TabsContent>

        <TabsContent value="sectores" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="">
                    <div>
                      <CardTitle>Gestión de Sectores</CardTitle>
                      <CardDescription>
                        Esta sección está en desarrollo
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Construction className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Funcionalidad en Desarrollo
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Estamos trabajando en nuevas características para la
                      gestión de sectores que estarán disponibles pronto.
                    </p>
                    <Badge variant="outline">Próximamente</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-1">
              <CreateSubSectorForm />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeadsPage;
