"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  User,
  Clock,
  History,
  FileText,
  ExternalLink,
  Loader2,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import { toast } from "sonner";
import { ToastCustomMessage } from "@/components/ToastCustomMessage";
import { useCandidates } from "@/hooks/candidates/use-candidates";
import {
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Sheet } from "@/components/ui/sheet";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useUsers } from "@/hooks/users/use-users";

interface TernaHistoryEntry {
  id: string;
  deliveredAt: Date;
  validatedBy: {
    id: string;
    name: string;
    email: string;
  };
  candidates: {
    id: string;
    candidate: {
      id: string;
      name: string;
      email: string | null;
      phone: string | null;
      position: string | null;
      cv?: {
        url: string;
        name: string;
      } | null;
    };
    addedAt: Date;
  }[];
}

interface TernaHistoryDialogProps {
  vacancyId: string;
  vacancyTitle: string;
}

export const TernaHistoryDialog = ({
  vacancyId,
  vacancyTitle,
}: TernaHistoryDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [ternaHistory, setTernaHistory] = useState<TernaHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { fetchTernaHistory } = useCandidates(vacancyId);
  const { loggedUser, fetchLoggedUser } = useUsers();

  useEffect(() => {
    fetchLoggedUser();
  }, [fetchLoggedUser]);

  if (!loggedUser) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleOpenDialog = async () => {
    setIsOpen(true);
    setIsLoading(true);

    try {
      const history: TernaHistoryEntry[] = await fetchTernaHistory(vacancyId);
      setTernaHistory(history);
    } catch (error) {
      toast.custom((t) => (
        <ToastCustomMessage
          title="Error al cargar historial"
          message={error instanceof Error ? error.message : "Error desconocido"}
          type="error"
          onClick={() => toast.dismiss(t)}
        />
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatDateShort = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenDialog}
          className="gap-2"
        >
          <History className="h-4 w-4" />
          Historial
        </Button>
      </SheetTrigger>
      <SheetContent className="z-[9999] min-w-[30vw] overflow-y-auto">
        <SheetHeader>
          <DialogTitle className="text-lg">
            Historial de Ternas - {vacancyTitle}
          </DialogTitle>
          <DialogDescription>
            Registro de todas las ternas validadas para esta vacante
          </DialogDescription>
        </SheetHeader>

        <div className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 mb-2" />
              <p className="text-sm text-muted-foreground ml-3">
                Cargando historial...
              </p>
            </div>
          ) : ternaHistory.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No hay historial de ternas
              </h3>
              <p className="text-sm text-muted-foreground">
                Esta vacante aún no tiene ternas validadas registradas.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <Accordion type="single" collapsible className="w-full">
                {ternaHistory.map((entry, index) => (
                  <AccordionItem
                    value={entry.id}
                    key={entry.id}
                    className="border rounded-lg mb-3 px-4"
                  >
                    <AccordionTrigger className="py-4 text-[15px] leading-6 hover:no-underline">
                      <div className="flex items-center justify-between w-full mr-4">
                        <div className="flex items-center gap-3">
                          <Badge variant="default" className="text-xs">
                            Terna #{ternaHistory.length - index}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {formatDateShort(entry.deliveredAt)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{entry.validatedBy.name}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {entry.candidates.length} candidatos
                          </Badge>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      <div className="space-y-3 pt-2">
                        {/* Información detallada de la fecha */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                          <Clock className="h-4 w-4" />
                          <span>
                            Validada el {formatDate(entry.deliveredAt)}
                          </span>
                        </div>

                        {/* Lista de candidatos minimalista */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-foreground mb-3">
                            Candidatos de la terna:
                          </h4>
                          <div className="space-y-2">
                            {entry.candidates.map((candidateEntry) => (
                              <div
                                key={candidateEntry.id}
                                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarFallback className="text-sm font-medium">
                                      {candidateEntry.candidate.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground">
                                      {candidateEntry.candidate.name}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                      {candidateEntry.candidate.email && (
                                        <span>
                                          {candidateEntry.candidate.email}
                                        </span>
                                      )}
                                      {candidateEntry.candidate.phone && (
                                        <span>
                                          {candidateEntry.candidate.phone}
                                        </span>
                                      )}
                                    </div>
                                    {candidateEntry.candidate.position && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {candidateEntry.candidate.position}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Enlace al CV */}
                                {candidateEntry.candidate.cv?.url && (
                                  <Link
                                    href={candidateEntry.candidate.cv.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-3 py-1.5 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors"
                                  >
                                    <FileText className="h-3 w-3" />
                                    <span>Ver CV</span>
                                    <ExternalLink className="h-3 w-3" />
                                  </Link>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
