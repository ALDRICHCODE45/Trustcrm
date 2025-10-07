import { notFound } from "next/navigation";
import { TrendingUp, X, Check, AlertCircle } from "lucide-react";
import { ClientProfileHeader } from "./components/ClientProfileHeader";
import { CardGeneralInformation } from "./components/CardGeneralInformation";
import { ResumenFinancieroCard } from "./components/ResumenFinancieroCard";
import { ClientesContactosCard } from "./components/ClientesContactosCard";
import { ClientTabsWrapper } from "./components/ClientTabsWrapper";
import prisma from "@/core/lib/db";
import { auth } from "@/core/lib/auth";
import { ClientWithRelations } from "../../list/clientes/columns";

interface PageProps {
  params: Promise<{ id: string }>;
}

const fetchClient = async (
  clientId: string
): Promise<ClientWithRelations | null> => {
  try {
    const client = await prisma.client.findUnique({
      where: {
        id: clientId,
      },
      include: {
        usuario: true,
        comentarios: true,
        lead: {
          include: {
            origen: true,
          },
        },
        contactos: true,
        origen: true,
      },
    });
    return client;
  } catch (err) {
    throw new Error("Error al cargar los datos del ciente");
  }
};

export default async function ClientProfilePage({ params }: PageProps) {
  const { id } = await params;
  const cliente = await fetchClient(id);
  const session = await auth();
  if (!session?.user) {
    notFound();
  }
  const user = {
    name: session.user.name,
    id: session.user.id,
    role: session.user.role,
  };

  if (!cliente) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Encabezado y resumen general */}
      <ClientProfileHeader client={cliente} user={user} />
      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda y central (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tarjetas de KPI */}
          <div className="grid grid-cols-2  md:grid-cols-2 lg:grid-cols-4  gap-4">
            <CardGeneralInformation
              borderColor="border-l-primary"
              Icon={TrendingUp}
              iconColor="text-green-500"
              info={cliente.asignadas ?? 0}
              title="Asignadas"
            />

            <CardGeneralInformation
              borderColor="border-l-[#ff0033]"
              Icon={X}
              iconColor="text-destructive"
              info={cliente.perdidas ?? 0}
              title="Perdidas"
            />
            <CardGeneralInformation
              borderColor="border-l-[#f5a010]"
              Icon={AlertCircle}
              iconColor="text-amber-500"
              info={cliente.canceladas ?? 0}
              title="Canceladas"
            />
            <CardGeneralInformation
              borderColor="border-l-green-500"
              Icon={Check}
              iconColor="text-green-500"
              info={cliente.placements ?? 0}
              title="Placements"
            />
          </div>
          {/* Pestañas principales */}
          <ClientTabsWrapper cliente={cliente} />
        </div>
        {/* Columna derecha (1/3) */}
        <div className="space-y-6">
          {/* Resumen financiero Component */}
          <ResumenFinancieroCard client={cliente} />
          {/* Contactos */}
          <ClientesContactosCard client={cliente} />
        </div>
      </div>
    </div>
  );
}
