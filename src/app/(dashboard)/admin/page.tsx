import { auth } from "@/core/lib/auth";
import { AdminPage } from "./components/AdminPage";
import { Role } from "@prisma/client";
import { checkRoleRedirect } from "../../helpers/checkRoleRedirect";
import prisma from "@/core/lib/db";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Trust | Dashboard",
};

const getClientsCount = async () => {
  try {
    const clientsCount = await prisma.client.count();
    return clientsCount;
  } catch (error) {
    console.error("Error al obtener el número de clientes:", error);
    return 0;
  }
};

const getUsersCount = async () => {
  try {
    const usersCount = await prisma.user.count();
    return usersCount;
  } catch (error) {
    console.error("Error al obtener el número de usuarios:", error);
    return 0;
  }
};

export default async function Dashboardpage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }
  checkRoleRedirect(session?.user.role as Role, [Role.Admin]);
  const userCount = await getUsersCount();
  const clientsCount = await getClientsCount();

  return (
    <>
      <AdminPage
        userCount={userCount}
        clientsCount={clientsCount}
        userId={session?.user.id as string}
      />
    </>
  );
}
