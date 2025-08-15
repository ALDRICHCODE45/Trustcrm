"use client";
import { useDroppable } from "@dnd-kit/core";
import { DraggableLeadCard } from "./DraggableLeadCard";
import {
  TagIcon,
  UsersIcon,
  PhoneIcon,
  CalendarIcon,
  CheckCircleIcon,
  HandshakeIcon,
  BriefcaseIcon,
  CircleX,
  UserCheck,
  Loader2,
} from "lucide-react";
import { User, Lead, LeadStatus } from "@prisma/client";
import { LeadWithRelations } from "@/hooks/use-infinite-leads";
import { leadStatusMap } from "@/app/(dashboard)/list/leads/components/LeadChangeStatus";
import { useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";

type KanbanColumnProps = {
  status: LeadStatus;
  leads: LeadWithRelations[];
  setSelectedTask: (task: Lead | null) => void;
  showCreateLeadForm: boolean;
  generadores?: User[];
  hasMore?: boolean;
  isLoading?: boolean;
  onLoadMore?: () => void;
  updateLeadInState?: (
    leadId: string,
    updates: Partial<LeadWithRelations>
  ) => void;
};

const getColumnIcon = (status: string) => {
  const icons = {
    [LeadStatus.Contacto]: (
      <TagIcon className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
    ),
    [LeadStatus.SocialSelling]: (
      <UsersIcon className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
    ),
    [LeadStatus.ContactoCalido]: (
      <PhoneIcon className="h-5 w-5 text-amber-500 dark:text-amber-400" />
    ),
    [LeadStatus.CitaAgendada]: (
      <CalendarIcon className="h-5 w-5 text-purple-500 dark:text-purple-400" />
    ),
    [LeadStatus.CitaValidada]: (
      <CheckCircleIcon className="h-5 w-5 text-green-500 dark:text-green-400" />
    ),
    [LeadStatus.Asignadas]: (
      <HandshakeIcon className="h-5 w-5 text-rose-500 dark:text-rose-400" />
    ),
    [LeadStatus.StandBy]: (
      <CircleX className="h-5 w-5 text-red-500 dark:text-red-400" />
    ),
    [LeadStatus.CitaAtendida]: <UserCheck className="size-5 text-green-300 " />,
  };
  return (
    icons[status as LeadStatus] || (
      <BriefcaseIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
    )
  );
};

// Count badge color based on status
const getBadgeColor = (status: string) => {
  const colorMap = {
    [LeadStatus.Contacto]:
      "bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300",
    [LeadStatus.SocialSelling]:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300",
    [LeadStatus.ContactoCalido]:
      "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300",
    [LeadStatus.CitaAgendada]:
      "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300",
    [LeadStatus.CitaValidada]:
      "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300",
    [LeadStatus.Asignadas]:
      "bg-rose-100 text-rose-600 dark:bg-rose-900 dark:text-rose-300",
    [LeadStatus.StandBy]:
      "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300",
    [LeadStatus.CitaAtendida]:
      "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300",
  };
  return (
    colorMap[status as LeadStatus] ||
    "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
  );
};

export const DroppableKanbanColumn = ({
  status,
  leads,
  setSelectedTask,
  generadores = [],
  hasMore = false,
  isLoading = false,
  onLoadMore,
  updateLeadInState,
}: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const leadTitle = leadStatusMap[status];
  const leadsColumnIcon = getColumnIcon(status);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Función para detectar scroll al final
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || isLoading || !hasMore || !onLoadMore) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const threshold = 50; // Pixels antes del final para comenzar a cargar

    if (scrollHeight - scrollTop - clientHeight < threshold) {
      onLoadMore();
    }
  }, [isLoading, hasMore, onLoadMore]);

  // Configurar el listener de scroll
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    scrollElement.addEventListener("scroll", handleScroll);
    return () => scrollElement.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div
      ref={setNodeRef}
      className={`w-[320px] flex-shrink-0 bg-[#f1f5f9] dark:bg-gray-800 rounded-3xl p-3 h-full flex flex-col ${
        isOver
          ? "border-2 border-dashed border-blue-400 dark:border-blue-500"
          : "border border-slate-200 dark:border-gray-700"
      }`}
    >
      <div
        className={`p-3 bg-white dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md`}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium flex items-center gap-2 text-gray-800 ">
            {leadsColumnIcon} {leadTitle}
          </span>
          <span
            className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${getBadgeColor(
              status
            )}`}
          >
            {leads.length}
          </span>
        </div>
      </div>
      <div ref={scrollRef} className="p-3 flex-1 overflow-y-auto scroll-smooth">
        <div className="space-y-2">
          {leads.map((lead) => (
            <DraggableLeadCard
              key={lead.id}
              lead={lead}
              setSelectedTask={setSelectedTask}
              updateLeadInState={updateLeadInState}
            />
          ))}

          {/* Indicador de carga y botón de cargar más */}
          {hasMore && (
            <div className="flex flex-col items-center py-4 space-y-2">
              {isLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando más leads...
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLoadMore}
                  className="text-xs h-8 px-3"
                >
                  Cargar más leads
                </Button>
              )}
            </div>
          )}

          {/* Mensaje cuando no hay más leads */}
          {!hasMore && leads.length > 0 && (
            <div className="text-center py-2 text-xs text-muted-foreground">
              No hay más leads
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
