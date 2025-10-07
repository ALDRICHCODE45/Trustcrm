import { UserColumns } from "./columns";
import { type ReactElement } from "react";
import { UsersTable } from "./table/UsersTable";
import { auth } from "@/core/lib/auth";
import prisma from "@/core/lib/db";
import { Role } from "@prisma/client";
import { checkRoleRedirect } from "@/app/helpers/checkRoleRedirect";
import { Metadata } from "next";

export interface pageProps {}

const fetchUsers = async () => {
  const users = await prisma.user.findMany({
    orderBy: {
      updatedAt: "desc",
    },
  });
  return {
    columns: UserColumns,
    data: users,
  };
};

export const metadata: Metadata = {
  title: "Trust | Users",
};

export default async function UserList({}: pageProps): Promise<ReactElement> {
  const session = await auth();

  checkRoleRedirect(session?.user.role as Role, [Role.Admin]);

  const { columns, data } = await fetchUsers();

  return (
    <div className="p-6">
      {/* LIST */}
      <div className="grid grid-cols-1 gap-6">
        <div className="col-span-1">
          <UsersTable columns={columns} data={data} />
        </div>
      </div>
    </div>
  );
}
