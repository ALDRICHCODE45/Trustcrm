import prisma from "@/core/lib/db";
import React from "react";
import { TaskKanbanBoard } from "./components/TaskKanbanBoard";
import { getSharedTasks } from "@/actions/tasks/actions";

interface Props {
  params: Promise<{ id: string }>;
}

const getTaskByUserId = async (userId: string) => {
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
        vacancy: {
          include: {
            cliente: true,
            reclutador: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return tasks;
  } catch (error) {
    throw new Error("Error fetching tasks in kanban");
  }
};

const getUserById = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    return user;
  } catch (error) {
    throw new Error("Error fetching user");
  }
};

export default async function TasksPage({ params }: Props) {
  const { id } = await params;

  // Obtener tareas propias, usuario y tareas compartidas
  const [tasks, user, sharedTasksResult] = await Promise.all([
    getTaskByUserId(id),
    getUserById(id),
    getSharedTasks(id),
  ]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Usuario no encontrado</h2>
          <p className="text-muted-foreground">
            No se pudo encontrar el usuario especificado.
          </p>
        </div>
      </div>
    );
  }

  // Extraer las tareas compartidas del resultado
  const sharedTasks = sharedTasksResult.ok ? sharedTasksResult.tasks : [];

  return (
    <div className="container max-w-7xl mx-auto p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">
          Actividades de {user.name}
        </h1>
        <p className="text-sm lg:text-base text-muted-foreground">
          Gestiona y organiza las tareas asignadas usando el tablero Kanban
        </p>
      </div>

      <TaskKanbanBoard
        user={user}
        initialTasks={tasks}
        sharedTasks={sharedTasks}
      />
    </div>
  );
}
