"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "@prisma/client";
import { useState } from "react";
import Lightbox from "yet-another-react-lightbox-lite";
import "yet-another-react-lightbox-lite/styles.css";
import { Badge } from "@/components/ui/badge";
import { EditUserProfile } from "@/app/(dashboard)/list/users/components/EditUserDropDown";
import { TaskWithUsers } from "@/app/(dashboard)/list/reclutamiento/components/ActivityProfileSheet";
import { UserInfoCard } from "@/app/(dashboard)/list/reclutamiento/components/UserInfoCard";
import { ChangePassword } from "@/app/(dashboard)/list/users/components/ChangePassword";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const oficinaMapper = {
  Oficina1: "Oficina 1",
  Oficina2: "Oficina 2",
};

export const UserProfileHeader = ({
  tasks,
  user,
  isAdmin,
  activeUserId,
}: {
  user: User;
  isAdmin: boolean;
  tasks: TaskWithUsers[];
  activeUserId: string;
}) => {
  const [index, setIndex] = useState<number>();

  //const value = user?.placements || user?.clientes || 32;
  const value = 0;

  return (
    <Card className="mb-6 shadow-sm overflow-hidden">
      {/* Banner superior con diseño mejorado */}
      <div className="h-40 bg-gradient-to-r from-primary/20 to-primary/5 relative">
        {/* Opciones de edición para admin posicionadas en el banner */}

        {isAdmin && (
          <div className="absolute top-4 right-4 flex gap-4">
            <div>
              <ChangePassword userId={user.id} />
            </div>

            <div>
              <EditUserProfile user={user} activeUserId={activeUserId} />
            </div>
          </div>
        )}
      </div>

      <CardContent className="px-0 pt-0 pb-6 relative">
        <div className="px-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Avatar con posición elevada sobre el banner */}
            <div className="relative -mt-16 flex justify-center lg:justify-start">
              <div className="relative">
                <Avatar
                  className="w-32 h-32 border-4 border-background shadow-md cursor-pointer"
                  onClick={() => setIndex(0)}
                >
                  <AvatarImage
                    src={user?.image ? user.image : undefined}
                    alt={user?.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-muted text-muted-foreground text-3xl">
                    {user?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Badge className="absolute bottom-1 right-1 bg-primary">
                  {user?.role}
                </Badge>
              </div>
              <Lightbox
                slides={[
                  {
                    src: `${
                      user?.image
                        ? user.image
                        : "https://gremcorpsarpg.com/images/avatars/default.jpg"
                    }`,
                  },
                ]}
                index={index}
                setIndex={setIndex}
              />
            </div>
            <div className="flex-1 mt-4  lg:-mt-10">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between bg-background/80 backdrop-blur-sm p-4 rounded-lg">
                <div>
                  <div className="flex gap-2 items-center">
                    <h2 className="text-2xl font-bold">{user?.name}</h2>

                    <Badge variant="outline" className="mt-1">
                      <p className="">{oficinaMapper[user.Oficina]}</p>
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{user?.email}</p>
                  {user?.ingreso && (
                    <p className="text-muted-foreground mt-1 text-sm">
                      Ingreso:{" "}
                      <Badge variant="outline" className="mt-1 text-xs">
                        {format(user?.ingreso, "EEE d/M/yyyy", { locale: es })}
                      </Badge>
                    </p>
                  )}
                </div>
                {/* TODO: FUNCIONALIDAD PARA VER TODAS LAS TAREAS COMPARTIDAS */}
                {/* <Button variant="outline"> */}
                {/*   <Repeat2 /> */}
                {/*   Compartidas */}
                {/* </Button> */}
                {/* Actividades del usuario */}
                {/* <ActivityProfileSheet user={user} tasks={tasks} /> */}

                <Tooltip>
                  <TooltipTrigger>
                    <Button variant="outline" className="mt-2" asChild>
                      <Link href={`/tasks/${user.id}`} className="">
                        <p className=" flex items-center dark:hover:text-white gap-1 text-muted-foreground text-md hover:text-black">
                          Actividades
                          <ExternalLink className="w-4 h-4" />
                        </p>
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Actividades de {user.name}</p>
                  </TooltipContent>
                </Tooltip>

                {/* <Button variant="outline" className="mt-2" asChild>
                  <Link href={`/tasks/${user.id}`}>
                    Actividades
                    <ExternalLink />
                  </Link>
                </Button> */}
              </div>
            </div>
          </div>

          {/* Tarjetas de información mejoradas */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mt-6">
            <UserInfoCard title="Edad" value={user.age} />
            <UserInfoCard
              title="Ubicación"
              value={user?.direccion}
              truncate={true}
              maxLength={30}
            />
            <UserInfoCard title="Contacto" value={user?.celular} />
            <UserInfoCard
              //title={user?.placements ? "Placements" : "Clientes"}
              title="placements"
              value={value}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
