"use client";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Clock, MessageCircleMore, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Comment } from "@prisma/client";
import { cn } from "@/core/lib/utils";

//=========================================================
//Este componente tiene datos mock y no esta implementado correctamente
//=========================================================

export const ComentariosSheet = ({ comments }: { comments: Comment[] }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <MessageCircleMore />
        </Button>
      </SheetTrigger>
      <SheetContent className="p-4">
        {/* Botón para abrir el diálogo */}
        <SheetHeader className="mt-7 mb-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus />
                Agregar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] z-[200] ">
              <DialogHeader>
                <DialogTitle>Nuevo Comentario</DialogTitle>
                <Separator />
              </DialogHeader>
              {/* Formulario dentro del diálogo */}
              <NuevoComentarioForm />
            </DialogContent>
          </Dialog>
        </SheetHeader>

        {/* Lista de comentarios */}
        <div className="space-y-4">
          {comments.map((comentario, index) => (
            <Card
              key={index}
              className="shadow-sm hover:shadow-md transition-shadow"
            >
              <CardHeader className="p-3 pb-1 flex flex-row justify-between items-center">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`flex items-center gap-1 ${
                      comentario.taskId === "Tarea"
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                        : "bg-gray-50 dark:bg-gray-800/30 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        comentario.taskId === "Tarea"
                          ? "bg-blue-600 dark:bg-blue-400"
                          : "bg-gray-500 dark:bg-gray-400"
                      }`}
                    ></div>
                    {comentario.taskId ? "Tarea" : "Comentario"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-gray-400" />
                  <p className="text-xs text-gray-400">
                    Lun {comentario.authorId} • {comentario.authorId}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {comentario.authorId}
                </p>
              </CardContent>
              <CardFooter className="flex flex-row items-center justify-between w-full p-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-400">
                  By:
                  <span className="text-gray-500 dark:text-gray-300">
                    {comentario.authorId} {comentario.authorId}
                  </span>
                </p>
                {comentario.taskId && comentario.authorId && (
                  <p className="text-xs text-gray-400">
                    Entrega:{" "}
                    <span className="font-medium text-gray-600 dark:text-gray-300">
                      {comentario.authorId}
                    </span>
                  </p>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

const NuevoComentarioForm = () => {
  const form = useForm({
    defaultValues: {
      texto: "",
      esTarea: false,
      fechaEntrega: undefined,
    },
  });
  const esTarea = form.watch("esTarea");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          console.log(data);
        })}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="texto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comentario</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Escribe tu comentario aquí..."
                  className="resize-none min-h-24"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="esTarea"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Marcar como tarea</FormLabel>
                <FormDescription>
                  Las tareas requieren una fecha de entrega
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value} // Usa `checked` en lugar de `value`
                  onCheckedChange={field.onChange} // Actualiza el valor booleano
                />
              </FormControl>
            </FormItem>
          )}
        />
        {esTarea && (
          <FormField
            control={form.control}
            name="fechaEntrega"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de entrega</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "EEE dd/MM/yy", { locale: es })
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[8888]">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </FormItem>
            )}
          />
        )}
        <div className="flex justify-end space-x-2 pt-2">
          <Button variant="outline" type="button">
            Cancelar
          </Button>
          <Button type="submit">Guardar</Button>
        </div>
      </form>
    </Form>
  );
};
