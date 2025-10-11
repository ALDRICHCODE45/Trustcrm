"use client";
import { Landmark, LucideIcon } from "lucide-react";
import * as React from "react";
import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  HandCoins,
  MonitorCog,
  ShieldBan,
  UserRoundCog,
  UserSearch,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Role, User } from "@prisma/client";

const data: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  teams: {
    name: string;
    logo: LucideIcon;
    plan: string;
  }[];
  navMain: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    roles?: Role[];
    items?: {
      title: string;
      url: string;
      roles?: Role[];
    }[];
  }[];
} = {
  user: {
    name: "Salvador Perea",
    email: "m@ejemplo.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Reclutamiento",
      url: "#",
      icon: UserSearch,
      roles: [Role.reclutador, Role.Admin],
      items: [
        {
          title: "Vacantes",
          url: "/reclutador",
          roles: [Role.reclutador, Role.Admin],
        },
        {
          title: "Kanban Board",
          url: "/reclutador/kanban",
          roles: [Role.reclutador, Role.Admin],
        },
        {
          title: "Reportes",
          url: "/reclutador/reportes",
          roles: [Role.reclutador, Role.Admin],
        },
      ],
    },
    {
      title: "Generacion de Leads",
      url: "#",
      icon: HandCoins,
      roles: [Role.GL, Role.MK, Role.Admin],
      items: [
        {
          title: "Prospecciones",
          url: "/leads",
          roles: [Role.GL, Role.MK, Role.Admin],
        },
        {
          title: "Kanban Board",
          url: "/leads/kanban",
          roles: [Role.GL, Role.MK, Role.Admin],
        },
        {
          title: "Reportes",
          url: "/leads/reportes",
          roles: [Role.Admin, Role.GL],
        },
      ],
    },
    {
      title: "Administración",
      url: "#",
      icon: ShieldBan,
      isActive: true,
      roles: [Role.Admin], // Solo visible para administradores
      items: [
        {
          title: "Usuarios",
          url: "/list/users",
          roles: [Role.Admin], // Solo visible para administradores
        },
        {
          title: "Clientes",
          url: "/list/clientes",
          roles: [Role.Admin], // Solo visible para administradores
        },
        // {
        //   title: "Clientes",
        //   url: "/list/clientes",
        //   roles: [Role.Admin],
        // },
      ],
    },
    {
      title: "Panel de control",
      url: "",
      icon: MonitorCog,
      isActive: true,
      roles: [Role.Admin],
      items: [
        {
          title: "Dashboard Administrativo",
          url: "/admin",
          roles: [Role.Admin],
        },
        // {
        //   title: "Reclutamiento",
        //   url: "/list/reclutamiento",
        //   roles: [Role.Admin],
        // },
        {
          title: "Configuracion",
          url: "/config",
          roles: [Role.Admin],
        },
        // {
        //   title: "kanban Board - Reclutamiento",
        //   url: "/reclutador/kanban",
        //   roles: [Role.Admin],
        // },
      ],
    },
    {
      title: "Sistema",
      url: "",
      icon: UserRoundCog,
      roles: [Role.Admin],
      items: [
        {
          title: "Logs",
          url: "/sistema/logs",
          roles: [Role.Admin],
        },
      ],
    },
    {
      title: "Finanzas",
      url: "",
      icon: Landmark,
      roles: [Role.Admin],
      items: [
        {
          title: "Cuentas",
          url: "/list/cuentas",
          roles: [Role.Admin],
        },
        {
          title: "Facturas",
          url: "/list/facturas",
          roles: [Role.Admin],
        },
      ],
    },
  ],
};

export function AppSidebar({
  user,
  hasPendingTasks,
}: {
  user: User;
  hasPendingTasks: boolean;
}) {
  // Filtrar los elementos del menú según el rol del usuario logeado
  const filteredNavMain = data.navMain
    .filter((item) => item.roles?.includes(user.role))
    .map((item) => ({
      ...item,
      items: item.items?.filter((subItem) =>
        subItem.roles?.includes(user.role)
      ),
    }));

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <NavUser user={user} hasPendingTasks={hasPendingTasks} />
      </SidebarHeader>
      <SidebarContent>
        {/* Pasar los elementos filtrados */}
        <NavMain items={filteredNavMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
