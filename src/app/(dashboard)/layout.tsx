import React, { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ClientLayout } from "./ClientLayout";
import { auth } from "@/core/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/core/lib/db";
import { ToastAlerts } from "@/components/ToastAlerts";
import { SpecialNotificationProvider } from "@/components/notifications/SpecialNotificationProvider";
import { unstable_noStore as noStore } from "next/cache";

interface LayoutProps {
  children: ReactNode;
}

const getUser = async (userEmail: string) => {
  noStore();

  const user = await prisma.user.findUnique({
    where: {
      email: userEmail,
    },
  });
  return user;
};

const getTasks = async (userId: string) => {
  noStore();
  try {
    const result = await prisma.task.findMany({
      where: {
        assignedToId: userId,
        status: "Pending",
      },
    });
    return result;
  } catch (error) {
    throw new Error("Error trayendo las tareas");
  }
};

export default async function Layout({ children }: LayoutProps) {
  const session = await auth();

  if (!session) redirect("/sign-in");

  const user = await getUser(session.user.email);

  if (!user) {
    redirect("/sign-in");
  }

  const taskWithPendingState = await getTasks(user.id);
  const hasPendingTasks = taskWithPendingState.length > 0;

  return (
    <>
      <ToastAlerts />
      <SpecialNotificationProvider userId={user.id}>
        <SidebarProvider>
          <AppSidebar user={user} hasPendingTasks={hasPendingTasks} />
          <SidebarInset>
            <ClientLayout user={user}>{children}</ClientLayout>
          </SidebarInset>
        </SidebarProvider>
      </SpecialNotificationProvider>
    </>
  );
}
