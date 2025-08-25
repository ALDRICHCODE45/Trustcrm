"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { VacancyWithRelations } from "@/app/(dashboard)/reclutador/components/ReclutadorColumns";

interface Props {
  form: any; // FormReturn from react-hook-form
  vacante: VacancyWithRelations;
}

export const EditVacancyDetailt = ({ form, vacante }: Props) => {
  return (
    <SheetContent className="min-w-[35vw] z-[100] min-h-[500px] overflow-y-auto">
      <SheetHeader>
        <SheetTitle>Detalles de la vacante</SheetTitle>
        <SheetDescription>Información detallada de la vacante</SheetDescription>
      </SheetHeader>

      <div className="grid grid-cols-1 gap-8 py-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-4">Información Financiera</h3>

          <FormField
            control={form.control}
            name="salario"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salario (neto)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    defaultValue={vacante.salario || undefined}
                    placeholder="Ej: 10000"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? undefined : Number(value));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <h3 className="text-lg font-semibold mb-4 mt-6">
            Información de la vacante
          </h3>

          <FormField
            control={form.control}
            name="prestaciones"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prestaciones</FormLabel>
                <FormControl>
                  <Input
                    defaultValue={vacante.prestaciones || undefined}
                    placeholder="Ej: 10 días de vacaciones"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="herramientas"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Herramientas de trabajo</FormLabel>
                <FormControl>
                  <Input
                    defaultValue={vacante.herramientas || undefined}
                    placeholder="Ej: Excel, CRM, etc"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="comisiones"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comisiones/Bonos</FormLabel>
                <FormControl>
                  <Input
                    defaultValue={vacante.comisiones || undefined}
                    placeholder="Ej: 10% de comisiones"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="modalidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modalidad (Híbrido, Remoto, Presencial)</FormLabel>
                <FormControl>
                  <Input
                    defaultValue={vacante.modalidad || undefined}
                    placeholder="Ej: Híbrido"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="horario"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horario</FormLabel>
                <FormControl>
                  <Input
                    defaultValue={vacante.horario || undefined}
                    placeholder="Ej: 9:00 AM - 6:00 PM"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="psicometria"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Psicometría (Sí / No)</FormLabel>
                <FormControl>
                  <Input
                    defaultValue={vacante.psicometria || undefined}
                    placeholder="Ej: Sí"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ubicacion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Ubicación de la posición (CDMX, Monterrey, etc.)
                </FormLabel>
                <FormControl>
                  <Input
                    defaultValue={vacante.ubicacion || undefined}
                    placeholder="Ej: CDMX"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="comentarios"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comentarios generales</FormLabel>
                <FormControl>
                  <Textarea
                    defaultValue={vacante.comentarios || undefined}
                    placeholder="Ej: El cliente indicó que sus horarios para entrevistas son determinados"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <SheetFooter>
        <SheetClose asChild>
          <Button variant="outline">Cerrar</Button>
        </SheetClose>
      </SheetFooter>
    </SheetContent>
  );
};
