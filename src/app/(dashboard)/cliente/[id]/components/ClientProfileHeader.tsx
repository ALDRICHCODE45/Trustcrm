"use client";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
// import { ClientEditForm } from "./EditCliente";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit3 } from "lucide-react";
import { NuevoComentarioForm } from "@/app/(dashboard)/list/reclutamiento/components/CommentSheet";
import { Role } from "@prisma/client";
import { EditClientForm } from "@/app/(dashboard)/list/clientes/components/EditClientForm";
import { notFound } from "next/navigation";
import { useState } from "react";
import { ClientWithRelations } from "@/app/(dashboard)/list/clientes/columns";
// import CreateVacanteForm from "../../../list/reclutamiento/components/CreateVacanteForm";

export const ClientProfileHeader = ({
  client,
  user,
}: {
  client: ClientWithRelations;
  user: {
    name: string;
    id: string;
    role: string;
  };
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const getClientStatus = () => {
    if (client.placements && client.placements > 5) return "outline";
    if (client.placements && client.placements > 2) return "destructive";
    return "default";
  };

  if (!client) {
    notFound();
  }

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
  };

  return (
    <div className="mb-6">
      <Card className="overflow-hidden border-none shadow-sm">
        <div className="h-32 bg-gradient-to-r from-primary/10 to-primary/5 relative">
          {user?.role === Role.Admin && (
            <div className="absolute top-4 right-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Edit3 className="h-4 w-4" />
                Editar Cliente
              </Button>
            </div>
          )}
        </div>
        {/* DIALOG CON EL FORMULARIO PARA EDITAR AL CLIENTE */}
        <EditClientForm
          clientData={client}
          isOpen={isEditDialogOpen}
          onClose={handleCloseEditDialog}
        />

        <div className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center -mt-12">
            <Avatar className="w-24 h-24 border-4 border-background shadow-md">
              <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                {client.cuenta?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="pt-2 sm:pt-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="text-2xl font-bold">{client.cuenta}</h1>
                <Badge variant={getClientStatus()} className="h-6 px-3">
                  {client.modalidad}
                </Badge>
              </div>
              <p className="text-muted-foreground">{client?.usuario?.name}</p>
            </div>

            <div className="sm:ml-auto flex flex-wrap gap-2 mt-2 sm:mt-0">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <PlusCircle />
                    Agregar Comentario
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] z-[200]">
                  <DialogHeader>
                    <DialogTitle>Nuevo Comentario</DialogTitle>
                    <Separator />
                  </DialogHeader>
                  {/* Formulario dentro del diálogo */}
                  <div className="text-muted-foreground">
                    {/* <NuevoComentarioForm /> */}
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" size="sm">
                <PlusCircle />
                Nueva Vacante
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
