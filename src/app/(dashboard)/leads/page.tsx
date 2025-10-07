import { type ReactElement } from "react";
import { auth } from "@/core/lib/auth";
import { Role } from "@prisma/client";
import { checkRoleRedirect } from "@/app/helpers/checkRoleRedirect";
import prisma from "@/core/lib/db";
import { LeadWithRelations } from "./kanban/page";
import { unstable_noStore as noStore } from "next/cache";
import { LeadsPageClient } from "./LeadsPageClient";

export interface pageProps {}

const fetchData = async (): Promise<{
  data: LeadWithRelations[];
}> => {
  noStore();

  const leads = await prisma.lead.findMany({
    include: {
      generadorLeads: true,
      origen: true,
      sector: true,
      SubSector: true,
      contactos: {
        include: {
          interactions: {
            include: {
              autor: true,
              contacto: true,
            },
          },
        },
      },
      statusHistory: {
        include: {
          changedBy: true,
        },
      },
    },
    orderBy: [
      {
        createdAt: "desc",
      },
      {
        updatedAt: "desc",
      },
    ],
  });
  return {
    data: leads,
  };
};

const fetchGeneradores = async () => {
  noStore();
  try {
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: [Role.GL, Role.Admin, Role.MK],
        },
      },
    });

    return users;
  } catch (err) {
    throw new Error("no se pueden fetchear los generadores");
  }
};
const fetchSectores = async () => {
  noStore();
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
  noStore();

  try {
    const origenes = await prisma.leadOrigen.findMany({});
    return origenes;
  } catch (err) {
    throw new Error("No se pueden fetchear los origenes");
  }
};

export default async function page({}: pageProps): Promise<ReactElement> {
  const { data } = await fetchData();

  const session = await auth();

  if (!session) {
    throw new Error("User does not exists");
  }
  const generadores = await fetchGeneradores();

  const sectores = await fetchSectores();
  const origenes = await fetchOrigenes();

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
