import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CommentWithRelations, EditCommentData } from "@/types/comment";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  comment: CommentWithRelations;
  onConfirm: (commentId: string, content: string) => Promise<void>;
}

export function EditCommentDialog({
  open,
  setOpen,
  comment,
  onConfirm,
}: Props) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const content = formData.get("content") as string;
    await onConfirm(comment.id, content);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px] z-[99999]">
        <DialogHeader>
          <DialogTitle>Editar comentario</DialogTitle>
          <DialogDescription>
            Edita el contenido del comentario
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="content">Contenido</Label>
              <Input
                id="content"
                name="content"
                defaultValue={comment.content}
              />
              <Input type="hidden" name="id" value={comment.id} />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit">Guardar cambios</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
