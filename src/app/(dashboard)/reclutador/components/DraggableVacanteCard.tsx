import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { VacanteCard } from "./VacanteCard";
import { VacancyWithRelations } from "./ReclutadorColumns";

interface DraggableVacanteCardProps {
  vacante: VacancyWithRelations;
  onClick: () => void;
}

export function DraggableVacanteCard({
  vacante,
  onClick,
}: DraggableVacanteCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: vacante.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <VacanteCard vacante={vacante} onClick={onClick} />
    </div>
  );
}
