import { ReactElement } from "react";
import { cuentaColumns } from "./cuentaColumns";
import { DataTable } from "@/components/Table";
import { ColumnDef } from "@tanstack/react-table";
import { auth } from "@/lib/auth";
import { checkRoleRedirect } from "../../../helpers/checkRoleRedirect";
import { Role } from "@prisma/client";
import { Metadata } from "next";

interface pageProps {}

export const metadata: Metadata = {
  title: "Trust | Cuentas",
};

/**
 * Falta implementar las facturas, ESTE APARTADO TIENE DATOS DE PRUEBA.
 *
 */

const fetchFacturas = async () => {
  return new Promise<{ columns: ColumnDef<any>[]; data: any[] }>((resolve) => {
    setTimeout(() => {
      resolve({
        columns: cuentaColumns,
        data: [],
      });
    }, 200);
  });
};

export default async function Cuentas({}: pageProps): Promise<ReactElement> {
  const { columns, data } = await fetchFacturas();

  const session = await auth();
  checkRoleRedirect(session?.user.role as Role, [Role.Admin]);

  return (
    <>
      {/* LIST */}
      <DataTable columns={columns} data={data} />
    </>
  );
}
