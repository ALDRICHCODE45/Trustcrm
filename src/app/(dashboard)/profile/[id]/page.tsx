import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { notFound, redirect } from "next/navigation";
import "yet-another-react-lightbox-lite/styles.css";
import { UserProfileHeader } from "./components/UserProfileHeader";
import { EventCalendar } from "@/components/EventCalendar";
import prisma from "@/core/lib/db";
import { auth } from "@/core/lib/auth";
import { Prisma, Role } from "@prisma/client";
import { Metadata } from "next";
import { AttendanceChart } from "@/components/AttendanceChart";
import { LeadPerformanceChart } from "../components/PerformanceChart";
import { RecruiterPlacementChart } from "@/components/RecruiterPlacementChart";
import { unstable_noStore as noStore } from "next/cache";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskWithUsers } from "../../list/reclutamiento/components/ActivityProfileSheet";
import { getTaskStatistics } from "@/actions/tasks/actions";

const fetchUser = async (userId: string) => {
  noStore();

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    return user;
  } catch (error) {
    throw Error("Error cargando el usuario en profilePage");
  }
};

export type TasksWithRelations = Prisma.TaskGetPayload<{
  include: {
    assignedTo: true;
  };
}>;

const fetchTasksById = async (userId: string): Promise<TaskWithUsers[]> => {
  noStore();
  try {
    const tasks = await prisma.task.findMany({
      where: {
        assignedToId: userId,
      },
      include: {
        assignedTo: true,
        notificationRecipients: true,
        linkedInteraction: {
          include: {
            contacto: true,
          },
        },
      },
    });
    return tasks;
  } catch (error) {
    throw new Error("Error en el fetch de tasks");
  }
};

export const metadata: Metadata = {
  title: "Trust | Perfil",
};

export default async function UserProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) {
    redirect("/sign-in");
  }
  const { id } = await params;

  const loadTasks = async () => {
    try {
      const tasks = await fetchTasksById(id);
      if (!tasks) {
        notFound();
      }

      return tasks;
    } catch (error) {
      throw new Error("Error fetcheando las tareas");
    }
  };

  const loadProfile = async () => {
    try {
      const usuario = await fetchUser(id);
      if (!usuario) {
        notFound();
      }
      return usuario;
    } catch {
      throw new Error("load profile error");
    }
  };

  const loadTaskStatistics = async () => {
    try {
      const result = await getTaskStatistics(id);
      if (!result.ok) {
        console.error("Error obteniendo estadísticas:", result.message);
        return {
          tasksCompletedThisMonth: 0,
          totalCompletedTasks: 0,
          overdueTasks: 0,
        };
      }
      return result.statistics;
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
      return {
        tasksCompletedThisMonth: 0,
        totalCompletedTasks: 0,
        overdueTasks: 0,
      };
    }
  };

  const user = await loadProfile();
  const tasks = await loadTasks();
  const taskStatistics = await loadTaskStatistics();

  return (
    <>
      <div className="container mx-auto p-4 md:p-6">
        {/* Header - User Basic Info */}
        <UserProfileHeader
          activeUserId={session.user.id}
          user={user}
          isAdmin={session?.user.role === Role.Admin}
          tasks={tasks}
        />

        <div className="w-full mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Columna izquierda - Estadísticas y Gráficas */}
            <div className="lg:col-span-8 space-y-6">
              {/* Estadísticas rápidas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-500">Este mes</p>
                    <p className="text-2xl font-medium mt-1">
                      {taskStatistics.tasksCompletedThisMonth}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-500">Tareas Vencidas</p>
                    <p className="text-2xl font-medium mt-1">
                      {taskStatistics.overdueTasks}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-500">Tareas Completadas</p>
                    <p className="text-2xl font-medium mt-1">
                      {taskStatistics.totalCompletedTasks}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Estadisticas para generadores de leads*/}
              {user.role === Role.GL && (
                <Card className="border">
                  <CardHeader className="pb-2">
                    <Tabs defaultValue="performance" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="performance">
                          Rendimiento
                        </TabsTrigger>
                        <TabsTrigger value="attendance">Asistencia</TabsTrigger>
                      </TabsList>
                      <TabsContent value="performance" className="mt-4">
                        <LeadPerformanceChart />
                      </TabsContent>
                      <TabsContent value="attendance" className="mt-4">
                        <AttendanceChart />
                      </TabsContent>
                    </Tabs>
                  </CardHeader>
                </Card>
              )}

              {/* Estadisticas para reclutadores*/}
              {user.role === Role.Admin && (
                <Card className="border">
                  <CardHeader className="pb-2">
                    <Tabs defaultValue="placements" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="placements">
                          Generación de leads
                        </TabsTrigger>
                        <TabsTrigger value="attendance">Asistencia</TabsTrigger>
                      </TabsList>
                      <TabsContent value="placements" className="mt-4">
                        <LeadPerformanceChart />
                      </TabsContent>
                      <TabsContent value="attendance" className="mt-4">
                        <AttendanceChart />
                      </TabsContent>
                    </Tabs>
                  </CardHeader>
                </Card>
              )}

              {/* Estadisticas para reclutadores*/}
              {user.role === Role.reclutador && (
                <Card className="border">
                  <CardHeader className="pb-2">
                    <Tabs defaultValue="placements" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="placements">Placements</TabsTrigger>
                        <TabsTrigger value="attendance">Asistencia</TabsTrigger>
                      </TabsList>
                      <TabsContent value="placements" className="mt-4">
                        <RecruiterPlacementChart recruiterId={user.id} />
                      </TabsContent>
                      <TabsContent value="attendance" className="mt-4">
                        <AttendanceChart />
                      </TabsContent>
                    </Tabs>
                  </CardHeader>
                </Card>
              )}
            </div>

            {/* Columna derecha - Calendario */}
            <div className="lg:col-span-4">
              <Card className="border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-center"></CardTitle>
                  <CardDescription className="text-center"></CardDescription>
                </CardHeader>
                <CardContent>
                  <EventCalendar userId={user.id} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
