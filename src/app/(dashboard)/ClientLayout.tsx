"use client";
import React, { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/themeToggle";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { User } from "@prisma/client";

interface ClientLayoutProps {
  children: ReactNode;
  user: User;
}

export function ClientLayout({ children, user }: ClientLayoutProps) {
  const router = useRouter();
  const pathName = usePathname();
  let currentUrl = pathName.split("/").at(-1);

  if (pathName.split("/").at(1) === "profile") {
    currentUrl = "Usuario";
  } else if (pathName.split("/").at(1) === "tasks") {
    currentUrl = "Tareas";
  } else if (
    pathName.split("/").at(1) === "reclutador" &&
    pathName.split("/").at(2) === "kanban"
  ) {
    currentUrl = "Kanban Board - Reclutamiento";
  } else if (
    pathName.split("/").at(1) === "leads" &&
    pathName.split("/").at(2) === "kanban"
  ) {
    currentUrl = "Kanban Board - Generación de Leads";
  } else if (pathName.split("/").at(1) === "cliente") {
    currentUrl = "Cliente";
  }

  return (
    <>
      {/* Header with fixed position */}
      <header className="sticky z-10 top-0 flex justify-between h-16 shrink-0 items-center border-b bg-white dark:bg-[#121212] px-4">
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarTrigger className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-md transition-colors" />
            </TooltipTrigger>
            <TooltipContent className="dark px-2 py-1 text-xs" showArrow={true}>
              <span>Abrir/Cerrar Sidebar</span>
            </TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" className="h-6" />
          <ModeToggle />
          <Separator orientation="vertical" className="h-6 hidden md:block" />
          {/* Improved Breadcrumb with back button */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <button
                  onClick={() => router.back()}
                  className="flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-sm font-medium">Back</span>
                    </TooltipTrigger>
                    <TooltipContent
                      className="dark px-2 py-1 text-xs"
                      showArrow={true}
                    >
                      <span>Ir a la pagina anterior</span>
                    </TooltipContent>
                  </Tooltip>
                </button>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium text-primary">
                  {currentUrl}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        {/* Right side of navbar - add user profile or actions */}
        <div className="flex gap-5 items-center">
          <NotificationDropdown
            user_logged={{
              name: user.name,
              email: user.email,
              role: user.role,
              image: user.image || "",
              id: user.id,
            }}
          />
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center">
            <Image
              src="/trust-logo.webp"
              alt="Trust Logo"
              className=" rounded-full object-cover"
              width={45}
              height={45}
            />
          </div>
        </div>
      </header>
      {/* Content container with better padding */}
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-[#0e0e0e]">
        <div className="container mx-auto py-6 px-8 ">{children}</div>
      </main>
    </>
  );
}
