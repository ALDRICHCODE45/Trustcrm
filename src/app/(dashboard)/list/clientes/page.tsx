import { ReactElement } from "react";
import { DataTable } from "@/components/Table";
import { clientesColumns, ClientWithRelations } from "./columns";
import { ColumnDef } from "@tanstack/react-table";
import { checkRoleRedirect } from "../../../helpers/checkRoleRedirect";
import { auth } from "@/core/lib/auth";
import { LeadOrigen, Role, User } from "@prisma/client";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import prisma from "@/core/lib/db";
import { CreateClientModal } from "./components/CreateClienteModal";

interface pageProps {}

export const metadata: Metadata = {
  title: "Trust | Clientes",
};

const fetchClientes = async (): Promise<{
  columns: ColumnDef<ClientWithRelations>[];
  data: ClientWithRelations[];
}> => {
  try {
    const clients = await prisma.client.findMany({
      include: {
        lead: {
          include: {
            origen: true,
          },
        },
        contactos: true,
        usuario: true,
        comentarios: true,
        origen: true,
      },
    });

    return {
      columns: clientesColumns,
      data: clients,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Error al obtener los clientes");
  }
};

const fetchUser = async (): Promise<{ id: string; name: string }[]> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    return users;
  } catch (error) {
    console.error(error);
    throw new Error("Error al obtener los usuarios");
  }
};

const fetchOrigenes = async (): Promise<LeadOrigen[]> => {
  try {
    const origenes = await prisma.leadOrigen.findMany();
    return origenes;
  } catch (error) {
    console.error(error);
    throw new Error("Error al obtener los origenes");
  }
};

export default async function ClientesList({}: pageProps): Promise<ReactElement> {
  const { columns, data } = await fetchClientes();
  const users = await fetchUser();
  const origenes = await fetchOrigenes();
  const session = await auth();
  if (!session) {
    redirect("/sign-in");
  }
  checkRoleRedirect(session?.user.role as Role, [Role.Admin]);

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 gap-6">
        <div className="col-span-1">
          {/* LIST */}
          <div className="flex justify-end mb-4">
            <CreateClientModal users={users} origenes={origenes} />
          </div>
          <DataTable columns={columns} data={data} />
        </div>
      </div>
    </div>
  );
}
