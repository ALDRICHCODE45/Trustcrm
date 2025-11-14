import { ReactElement } from "react";
import { DataTable } from "@/components/Table";
import { facturasColumns } from "./facturasColumns";
import { ColumnDef } from "@tanstack/react-table";
import { auth } from "@/core/lib/auth";
import { Role } from "@prisma/client";
import { checkRoleRedirect } from "../../../helpers/checkRoleRedirect";
import { Metadata } from "next";

interface pageProps {}

export const metadata: Metadata = {
  title: "People Flow | Facturas",
};

/**
 * Falta implementar las facturas, ESTE APARTADO TIENE DATOS DE PRUEBA.
 *
 */

const fetchFacturas = async () => {
  return new Promise<{ columns: ColumnDef<any>[]; data: any[] }>((resolve) => {
    setTimeout(() => {
      resolve({
        columns: facturasColumns,
        data: [],
      });
    });
  });
};

export default async function FacturasPage({}: pageProps): Promise<ReactElement> {
  const { columns, data } = await fetchFacturas();

  const session = await auth();
  checkRoleRedirect(session?.user.role as Role, [Role.Admin]);

  return (
    <>
      <DataTable columns={columns} data={data} />
    </>
  );
}
