import { auth } from "@/lib/auth";
import KanbanLeadsBoard from "./ClientPage";
import { log } from "console";
import { Role, LeadStatus } from "@prisma/client";
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";
import { Metadata } from "next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LeadHistory from "./components/LeadHistory";

export type LeadWithRelations = Prisma.LeadGetPayload<{
  include: {
    sector: true;
    origen: true;
    generadorLeads: true;
    SubSector: true;
    contactos: {
      include: {
        interactions: {
          include: {
            contacto: true;
            autor: true;
            linkedTasks: true;
          };
        };
      };
    };
    statusHistory: {
      include: {
        changedBy: true;
      };
    };
  };
}>;

const getInitialLeadsByStatus = async () => {
  try {
    const leadStatusEnum = Object.values(LeadStatus);

    // Obtener primeros 50 leads por cada estado en paralelo
    const promises = leadStatusEnum.map(async (status) => {
      const [leads, totalCount] = await Promise.all([
        prisma.lead.findMany({
          where: { status: status as any },
          include: {
            // Solo lo necesario para la vista inicial
            sector: { select: { id: true, nombre: true } },
            origen: { select: { id: true, nombre: true } },
            generadorLeads: { select: { id: true, name: true } },
            SubSector: { select: { id: true, nombre: true } },
            _count: { select: { contactos: true } },
            contactos: {
              select: {
                id: true,
                name: true,
                position: true,
                email: true,
                phone: true,
                linkedin: true,
                etiqueta: true,
                leadId: true,
              },
              orderBy: { name: "asc" },
            },
            statusHistory: {
              include: { changedBy: { select: { id: true, name: true } } },
              orderBy: { changedAt: "desc" },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 50,
        }),
        prisma.lead.count({
          where: { status: status as any },
        }),
      ]);

      return {
        status: status as any,
        leads,
        pagination: {
          page: 1,
          limit: 50,
          totalCount,
          totalPages: Math.ceil(totalCount / 50),
          hasMore: totalCount > 50,
        },
      };
    });

    const results = await Promise.all(promises);

    // Organizar datos en el formato esperado
    const leadsData: any = {};
    const paginationInfo: any = {};

    results.forEach(({ status, leads, pagination }) => {
      leadsData[status] = leads;
      paginationInfo[status] = pagination;
    });

    return { leadsData, paginationInfo };
  } catch (error) {
    log(error);
    throw new Error("Error trayendo las tareas");
  }
};

const getGeneradores = async () => {
  try {
    const generadores = await prisma.user.findMany({
      where: {
        role: {
          in: [Role.MK, Role.GL, Role.Admin],
        },
      },
    });
    return generadores;
  } catch (error) {
    log("Error");

    throw new Error("Generadores");
  }
};

export const metadata: Metadata = {
  title: "Kanban | Leads",
};

const page = async () => {
  const session = await auth();

  if (!session?.user.id) {
    throw new Error("Id is required");
  }

  const { leadsData, paginationInfo } = await getInitialLeadsByStatus();
  const generadores = await getGeneradores();

  return (
    <>
      <Tabs defaultValue="kanban" className="w-full">
        <TabsList>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>
        <TabsContent value="kanban">
          <KanbanLeadsBoard
            initialLeadsData={leadsData}
            initialPaginationInfo={paginationInfo}
            generadores={generadores}
          />
        </TabsContent>
        <TabsContent value="history">
          <LeadHistory generadores={generadores} />
        </TabsContent>
      </Tabs>
    </>
  );
};

export default page;
