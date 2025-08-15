"use client";
import { useDraggable } from "@dnd-kit/core";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DialogTrigger } from "@/components/ui/dialog";
import { Lead } from "@prisma/client";
import { LeadWithRelations } from "../page";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { getStatusColor, LeadSheet } from "./SheetLead";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock3, Users } from "lucide-react";
import { leadStatusMap } from "@/app/(dashboard)/list/leads/components/LeadChangeStatus";
import { Separator } from "@/components/ui/separator";
import { getDiffDays } from "@/app/helpers/getDiffDays";

type LeadCardProps = {
  lead: LeadWithRelations & { _count?: { contactos: number } };
  setSelectedTask: (task: Lead | null) => void;
  updateLeadInState?: (
    leadId: string,
    updates: Partial<LeadWithRelations>
  ) => void;
};

export const DraggableLeadCard = ({
  lead,
  setSelectedTask,
  updateLeadInState,
}: LeadCardProps) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: lead.id,
    data: { lead },
  });

  const days = getDiffDays(lead.createdAt);
  const contactosCount =
    (lead as any)?._count?.contactos ?? lead.contactos?.length ?? 0;

  return (
    <Sheet>
      <DialogTrigger asChild>
        <Card
          ref={setNodeRef}
          {...attributes}
          {...listeners}
          className={`p-3 cursor-move bg-white border shadow-xl ${
            isDragging ? "opacity-50 border-slate-300" : "border-gray-200"
          }  hover:shadow-sm transition-all rounded-xl`}
          onClick={() => setSelectedTask(lead)}
        >
          <div className="space-y-2">
            <div>
              <Badge className={getStatusColor(lead.status)} variant="outline">
                {leadStatusMap[lead.status]}
              </Badge>
            </div>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium  text-slate-800">{lead.empresa}</h3>
                <p className="text-md text-slate-500 mt-1">
                  {lead.sector.nombre}
                </p>
              </div>
            </div>
            <div className="pt-1 pb-1">
              <Separator orientation="horizontal" />
            </div>
          </div>

          <div className="flex items-center justify-between w-full">
            <div className="flex items-center  border-t border-slate-50">
              <div className="flex items-center space-x-1">
                <Avatar className="size-5">
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                    {lead.generadorLeads?.name
                      ? lead.generadorLeads.name[0].toUpperCase()
                      : "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs capitalize text-slate-500">
                  {lead.generadorLeads?.name?.split(" ")[0] || "Usuario"}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-gray-500" />
                <Badge variant="outline">
                  <p className="text-black text-xs">{contactosCount}</p>
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Clock3 size={14} className="text-gray-500" />
                <Badge variant="outline">
                  <p className="text-black text-xs">{days}</p>
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      </DialogTrigger>
      <SheetContent>
        <LeadSheet lead={lead} updateLeadInState={updateLeadInState} />
      </SheetContent>
    </Sheet>
  );
};
