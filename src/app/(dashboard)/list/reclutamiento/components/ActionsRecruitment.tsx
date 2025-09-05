"use client";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Clipboard, MoreHorizontal, SquarePen, Trash2 } from "lucide-react";
import { Row } from "@tanstack/react-table";
import { VacancyWithRelations } from "@/app/(dashboard)/reclutador/components/ReclutadorColumns";
import { EditVacancyForm } from "./EditVacancyForm";
import { toast } from "sonner";
import { ToastCustomMessage } from "@/components/ToastCustomMessage";
import { deleteVacancy } from "@/actions/vacantes/actions";

export const ActionsRecruitment = ({
  row,
}: {
  row: Row<VacancyWithRelations>;
}) => {
  const [openEdit, setOpenEdit] = useState<boolean>(false);

  const handleCloseEdit = () => {
    setOpenEdit(false);
  };

  const handleDeleteVacancy = async (vacancyId: string) => {
    try {
      const result = await deleteVacancy(vacancyId);
      if (!result.ok) {
        toast.custom((t) => (
          <ToastCustomMessage
            title="Error al eliminar la vacante"
            message="La vacante no pudo ser eliminada"
            onClick={() => {
              toast.dismiss(t);
            }}
            type="error"
          />
        ));
        return;
      }
      toast.custom((t) => (
        <ToastCustomMessage
          title="Vacante eliminada correctamente"
          message="La vacante ha sido eliminada correctamente"
          onClick={() => {
            toast.dismiss(t);
          }}
          type="success"
        />
      ));
    } catch (err) {
      toast.custom((t) => (
        <ToastCustomMessage
          title="Error al eliminar la vacante"
          message="La vacante no pudo ser eliminada"
          onClick={() => {
            toast.dismiss(t);
          }}
          type="error"
        />
      ));
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open Menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="cursor-pointer">
            <Clipboard />
            Copiar
          </DropdownMenuItem>

          <EditVacancyForm
            open={openEdit}
            setOpen={handleCloseEdit}
            vacancy={row.original}
          />
          <DropdownMenuSeparator />

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                className="cursor-pointer"
                variant="destructive"
                onSelect={(e) => e.preventDefault()}
              >
                <Trash2 />
                Eliminar
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent className="">
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Esto eliminará
                  permanentemente la vacante.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeleteVacancy(row.original.id)}
                >
                  Continuar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
