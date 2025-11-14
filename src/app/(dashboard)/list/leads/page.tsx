import { auth } from "@/core/lib/auth";
import { checkRoleRedirect } from "@/app/helpers/checkRoleRedirect";
import { Role } from "@prisma/client";
import prisma from "@/core/lib/db";
import { Metadata } from "next";
import { LeadWithRelations } from "../../leads/kanban/page";
import { LeadsPageClient } from "../../leads/LeadsPageClient";

interface pageProps {}

export const metadata: Metadata = {
  title: "People | Leads",
};

const fetchData = async (): Promise<{
  data: LeadWithRelations[];
}> => {
  const leads = await prisma.lead.findMany({
    include: {
      SubSector: true,
      generadorLeads: true,
      contactos: {
        include: {
          interactions: {
            include: {
              contacto: true,
              autor: true,
            },
          },
        },
      },
      sector: true,
      origen: true,
      statusHistory: {
        include: {
          changedBy: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    data: leads,
  };
};

const fetchGeneradores = async () => {
  const users = await prisma.user.findMany({
    where: {
      role: {
        in: [Role.GL, Role.Admin, Role.MK],
      },
    },
  });

  return users;
};

const fetchSectores = async () => {
  try {
    const sectores = await prisma.sector.findMany({
      select: { id: true, nombre: true },
    });
    return sectores;
  } catch (err) {
    throw new Error("No se pueden fetchear los sectores");
  }
};

const fetchOrigenes = async () => {
  try {
    const origenes = await prisma.leadOrigen.findMany({});
    return origenes;
  } catch (err) {
    throw new Error("No se pueden fetchear los origenes");
  }
};

export default async function LeadsPage({}: pageProps) {
  const { data } = await fetchData();
  const session = await auth();

  const generadores = await fetchGeneradores();

  const sectores = await fetchSectores();
  const origenes = await fetchOrigenes();

  if (!session) {
    throw new Error("User does not exists");
  }

  checkRoleRedirect(session?.user.role as Role, [Role.Admin, Role.GL, Role.MK]);

  const isAdmin = session?.user.role === Role.Admin;
  const activeUser = {
    name: session.user.name,
    id: session.user.id,
    role: session.user.role as Role,
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 gap-6">
        <div className="col-span-1">
          <LeadsPageClient
            initialData={data}
            generadores={generadores}
            sectores={sectores}
            origenes={origenes}
            isAdmin={isAdmin}
            activeUser={activeUser}
          />
        </div>
      </div>
    </div>
  );
}
