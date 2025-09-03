"use client";
import { memo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Mail,
  Phone,
  FileText,
  ExternalLink,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import { PersonWithRelations } from "./CandidatesTableSheet";
import { CompareChecklistForm } from "../VacancyFormComponents/CreateVacancyComponents/CompareChecklistForm";
import { VacancyWithRelations } from "../../../reclutador/components/ReclutadorColumns";
import { CandidateSheetDetails } from "@/app/(dashboard)/reclutador/kanban/components/CandidateSheetDetails";

interface OptimizedCandidateCardProps {
  candidate: PersonWithRelations;
  vacancy: VacancyWithRelations;
  onEdit: (candidate: PersonWithRelations) => void;
  onDelete: (candidateId: string) => void;
  refreshCandidates: () => void;
}

export const OptimizedCandidateCard = memo(
  ({
    candidate,
    vacancy,
    onEdit,
    onDelete,
    refreshCandidates,
  }: OptimizedCandidateCardProps) => {
    const handleEdit = useCallback(() => {
      onEdit(candidate);
    }, [onEdit, candidate]);

    const handleDelete = useCallback(() => {
      onDelete(candidate.id);
    }, [onDelete, candidate.id]);

    return (
      <Card className="shadow-sm hover:shadow-md transition-shadow border-l-2 border-l-primary">
        <CardHeader className="p-3 pb-1 flex flex-row justify-between items-start">
          <div className="flex justify-between items-center w-full">
            <div className="space-y-1">
              <CardTitle className="text-base font-medium">
                {candidate.name}
              </CardTitle>
            </div>
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Abrir menú</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  <DropdownMenuItem
                    onClick={handleEdit}
                    className="cursor-pointer"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-3 pt-1 space-y-2">
          <div className="flex items-center gap-2 justify-between">
            <div className="flex flex-col gap-1 items-start">
              <div className="flex gap-1 items-center">
                <Mail size={14} className="text-gray-400 mr-1" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {candidate.email ? candidate.email : "Sin email"}
                </p>
              </div>
              <div className="flex gap-1 items-center">
                <Phone size={14} className="text-gray-400 mr-1" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {candidate.phone ? candidate.phone : "Sin celular"}
                </p>
              </div>

              <div className="flex gap-1 items-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {candidate.cvFileId && (
                    <a
                      href={
                        typeof candidate.cv === "string"
                          ? candidate.cv
                          : (candidate.cv as any)?.url || ""
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      <span>Ver CV</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Información de estado con CompareChecklistForm */}
          <div className="mt-3 pt-2 border-t flex justify-between">
            <CompareChecklistForm
              vacante={vacancy}
              candidateId={candidate.id}
              refreshCandidates={refreshCandidates}
            />
            <CandidateSheetDetails candidate={candidate} side="left" />
          </div>
        </CardContent>
      </Card>
    );
  }
);

OptimizedCandidateCard.displayName = "OptimizedCandidateCard";
