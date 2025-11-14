import { type ReactElement } from "react";
import { RecruiterTable } from "../list/reclutamiento/table/RecruiterTableOptimized";
import {
  reclutadorColumns,
  VacancyWithRelations,
} from "./components/ReclutadorColumns";
import { ToastAlerts } from "@/components/ToastAlerts";
import { checkRoleRedirect } from "../../helpers/checkRoleRedirect";
import { auth } from "@/core/lib/auth";
import { Role, Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import prisma from "@/core/lib/db";

export interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}
const fetchReclutadores = async () => {
  try {
    const reclutadores = await prisma.user.findMany({
      where: {
        role: Role.reclutador,
      },
    });
    return reclutadores;
  } catch (err) {
    console.log(err);
    throw new Error("Error al devolver los reclutadores");
  }
};

interface FetchVacanciesParams {
  page: number;
  pageSize: number;
  search?: string;
  estados?: string[];
  reclutadores?: string[];
  clientes?: string[];
  tipos?: string[];
  oficinas?: string[];
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

const fetchVacancies = async ({
  page,
  pageSize,
  search,
  estados,
  reclutadores,
  clientes,
  tipos,
  oficinas,
  dateFrom,
  dateTo,
  sortBy,
  sortOrder = "desc",
}: FetchVacanciesParams): Promise<{
  rows: VacancyWithRelations[];
  totalCount: number;
}> => {
  try {
    // Construir el WHERE dinámicamente
    const where: Prisma.VacancyWhereInput = {};

    // Búsqueda global por posición
    if (search && search.trim()) {
      where.posicion = {
        contains: search.trim(),
        mode: "insensitive",
      };
    }

    // Filtro por estados
    if (estados && estados.length > 0) {
      where.estado = {
        in: estados as any[],
      };
    }

    // Filtro por reclutadores
    if (reclutadores && reclutadores.length > 0) {
      where.reclutadorId = {
        in: reclutadores,
      };
    }

    // Filtro por clientes
    if (clientes && clientes.length > 0) {
      where.clienteId = {
        in: clientes,
      };
    }

    // Filtro por tipos
    if (tipos && tipos.length > 0) {
      where.tipo = {
        in: tipos as any[],
      };
    }

    // Filtro por oficinas (a través del reclutador)
    if (oficinas && oficinas.length > 0) {
      where.reclutador = {
        Oficina: {
          in: oficinas as any[],
        },
      };
    }

    // Filtro por rango de fechas
    if (dateFrom || dateTo) {
      const fechaAsignacionFilter: Prisma.DateTimeFilter = {};

      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        // Asegurar que sea inicio del día (00:00:00.000)
        fromDate.setHours(0, 0, 0, 0);
        fechaAsignacionFilter.gte = fromDate;
      }

      if (dateTo) {
        const toDate = new Date(dateTo);
        // Asegurar que sea fin del día (23:59:59.999)
        toDate.setHours(23, 59, 59, 999);
        fechaAsignacionFilter.lte = toDate;
      }

      where.fechaAsignacion = fechaAsignacionFilter;
    }

    // Construir el ORDER BY dinámicamente
    let orderBy: Prisma.VacancyOrderByWithRelationInput = {
      updatedAt: "desc",
    };

    if (sortBy) {
      // Mapeo de IDs de columnas a nombres de campos en Prisma
      const fieldMapping: Record<string, string> = {
        asignacion: "fechaAsignacion", // El id de la columna "asignacion" mapea a "fechaAsignacion" en Prisma
      };

      const prismaField = fieldMapping[sortBy] || sortBy;
      orderBy = {
        [prismaField]: sortOrder,
      };
    }

    // Include común para reutilizar
    const include = {
      InputChecklist: {
        include: {
          InputChecklistFeedback: {
            include: {
              candidate: true,
            },
          },
        },
      },
      reclutador: true,
      cliente: true,
      candidatoContratado: {
        include: {
          cv: true,
          vacanciesContratado: true,
        },
      },
      ternaFinal: {
        include: {
          cv: true,
          vacanciesContratado: true,
        },
      },
      Comments: {
        include: {
          author: true,
        },
      },
      files: true,
    } as const;

    // Ejecutar queries en paralelo
    const [vacantes, totalCount] = await Promise.all([
      prisma.vacancy.findMany({
        where,
        include,
        orderBy,
        skip: page * pageSize,
        take: pageSize,
      }),
      prisma.vacancy.count({ where }),
    ]);

    return { rows: vacantes as VacancyWithRelations[], totalCount };
  } catch (err) {
    console.log(err);
    throw new Error("Error al devolver las vacantes");
  }
};

const fetchClientes = async () => {
  try {
    const clientes = await prisma.client.findMany();
    return clientes;
  } catch (err) {
    console.log(err);
    throw new Error("Error al devolver los clientes");
  }
};

// Helper para parsear params
const getParam = (value: string | string[] | undefined): string | undefined => {
  return Array.isArray(value) ? value[0] : value;
};

const getArrayParam = (
  value: string | string[] | undefined
): string[] | undefined => {
  if (!value) return undefined;
  if (Array.isArray(value)) return value;
  return value.split(",").filter(Boolean);
};

export default async function VacantesPage({
  searchParams,
}: PageProps): Promise<ReactElement> {
  const session = await auth();
  if (!session) {
    redirect("sign/in");
  }
  checkRoleRedirect(session?.user.role as Role, [Role.Admin, Role.reclutador]);

  const reclutadores = await fetchReclutadores();
  const params = (await searchParams) ?? {};

  // Parsear parámetros de paginación
  const page = Number(getParam(params.page) ?? 0) || 0;
  const pageSize = Number(getParam(params.pageSize) ?? 10) || 10;

  // Parsear filtros
  const search = getParam(params.search);
  const estados = getArrayParam(params.estados);
  const reclutadoresFilter = getArrayParam(params.reclutadores);
  const clientesFilter = getArrayParam(params.clientes);
  const tipos = getArrayParam(params.tipos);
  const oficinas = getArrayParam(params.oficinas);
  const dateFrom = getParam(params.dateFrom);
  const dateTo = getParam(params.dateTo);

  // Parsear sorting
  const sortBy = getParam(params.sortBy);
  const sortOrder = (getParam(params.sortOrder) as "asc" | "desc") ?? "desc";

  const { rows: vacantes, totalCount } = await fetchVacancies({
    page,
    pageSize,
    search,
    estados,
    reclutadores: reclutadoresFilter,
    clientes: clientesFilter,
    tipos,
    oficinas,
    dateFrom,
    dateTo,
    sortBy,
    sortOrder,
  });

  const clientes = await fetchClientes();
  const user_logged = {
    id: session?.user.id,
    name: session?.user.name,
    role: session?.user.role,
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 gap-6">
        <div className="col-span-1">
          {/* LIST */}
          <ToastAlerts />

          <RecruiterTable
            columns={reclutadorColumns}
            clientes={clientes}
            data={vacantes}
            reclutadores={reclutadores}
            user_logged={user_logged}
            totalCount={totalCount}
            defaultPageSize={pageSize}
            initialPageIndex={page}
          />
        </div>
      </div>
    </div>
  );
}
