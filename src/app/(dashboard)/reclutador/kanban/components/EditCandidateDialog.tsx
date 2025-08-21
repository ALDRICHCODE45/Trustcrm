"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PersonWithRelations } from "@/app/(dashboard)/list/reclutamiento/components/FinalTernaSheet";
import {
  createCandidateSchema,
  CreateCandidateFormData,
} from "@/zod/createCandidateSchema";
import { updateCandidate } from "@/actions/person/createCandidate";
import {
  uploadNewCvToCandidate,
  updateNewCvToCandidate,
  deleteCvFromCandidate,
} from "@/actions/person/actions";
import { toast } from "sonner";
import { ToastCustomMessage } from "@/components/ToastCustomMessage";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CVUploadSection } from "./CVUploadSection";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface EditCandidateDialogProps {
  refreshCandidates: () => void;
  open: boolean;
  closeDialog: () => void;
  onOpenChange: (open: boolean) => void;
  candidate: PersonWithRelations | null;
  onCandidateUpdated: (updatedCandidate: PersonWithRelations) => void;
}

export const EditCandidateDialog = ({
  refreshCandidates,
  open,
  closeDialog,
  onOpenChange,
  candidate,
  onCandidateUpdated,
}: EditCandidateDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateCandidateFormData>({
    resolver: zodResolver(createCandidateSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      cvFile: undefined,
      esta_empleado: false,
      sueldo_actual_o_ultimo: "",
      prestaciones_actuales_o_ultimas: "",
      bonos_comisiones: "",
      otros_beneficios: "",
      expectativa_económica: "",
      direccion_actual: "",
      modalidad_actual_o_ultima: "",
      ubicacion_ultimo_trabajo: "",
    },
  });

  // Actualizar valores del formulario cuando cambie el candidato
  useEffect(() => {
    if (candidate) {
      form.reset({
        name: candidate.name,
        phone: candidate.phone || "",
        email: candidate.email || "",
        cvFile: undefined,
        // valores por defecto para campos adicionales
        esta_empleado: (candidate as any)?.esta_empleado ?? false,
        sueldo_actual_o_ultimo:
          (candidate as any)?.sueldo_actual_o_ultimo || "",
        prestaciones_actuales_o_ultimas:
          (candidate as any)?.prestaciones_actuales_o_ultimas || "",
        bonos_comisiones: (candidate as any)?.bonos_comisiones || "",
        otros_beneficios: (candidate as any)?.otros_beneficios || "",
        expectativa_económica: (candidate as any)?.expectativa_económica || "",
        direccion_actual: (candidate as any)?.direccion_actual || "",
        modalidad_actual_o_ultima:
          (candidate as any)?.modalidad_actual_o_ultima || "",
        ubicacion_ultimo_trabajo:
          (candidate as any)?.ubicacion_ultimo_trabajo || "",
      });
    }
  }, [candidate, form, open]);

  const onSubmit = async (data: CreateCandidateFormData) => {
    if (!candidate?.id) return;

    try {
      setIsSubmitting(true);
      const result = await updateCandidate(candidate.id, data);

      if (!result.ok) {
        toast.custom((t) => (
          <ToastCustomMessage
            title="Error al actualizar candidato"
            message="El candidato no pudo ser actualizado"
            type="error"
            onClick={() => toast.dismiss(t)}
          />
        ));
        return;
      }

      toast.custom((t) => (
        <ToastCustomMessage
          title="Candidato actualizado exitosamente"
          message="El candidato ha sido actualizado exitosamente"
          type="success"
          onClick={() => toast.dismiss(t)}
        />
      ));

      // Actualizar el candidato en el componente padre
      const updatedCandidate = {
        ...candidate,
        ...data,
        name: data.name,
        phone: data.phone || null,
        email: data.email || null,
      } as unknown as PersonWithRelations;
      onCandidateUpdated(updatedCandidate);

      form.reset();
      onOpenChange(false);
    } catch (err) {
      console.error("Error al actualizar candidato:", err);
      toast.custom((t) => (
        <ToastCustomMessage
          title="Error al actualizar candidato"
          message="El candidato no pudo ser actualizado"
          type="error"
          onClick={() => toast.dismiss(t)}
        />
      ));
    } finally {
      setIsSubmitting(false);
      closeDialog();
    }
  };

  // Funciones para manejo del CV
  const handleUploadNewCV = async (file: File) => {
    if (!candidate?.id) return;

    try {
      const result = await uploadNewCvToCandidate(candidate.id, file);
      if (!result.ok) {
        toast.custom((t) => (
          <ToastCustomMessage
            title="Error al subir el CV"
            message="El CV no pudo ser subido"
            type="error"
            onClick={() => toast.dismiss(t)}
          />
        ));
        return;
      }

      toast.custom((t) => (
        <ToastCustomMessage
          title="CV subido exitosamente"
          message="El CV ha sido subido exitosamente"
          type="success"
          onClick={() => toast.dismiss(t)}
        />
      ));
    } catch (err) {
      toast.custom((t) => (
        <ToastCustomMessage
          title="Error al subir el CV"
          message="El CV no pudo ser subido"
          type="error"
          onClick={() => toast.dismiss(t)}
        />
      ));
    } finally {
      closeDialog();
      refreshCandidates();
    }
  };

  const handleUpdateCV = async (file: File) => {
    if (!candidate?.id) return;

    try {
      const result = await updateNewCvToCandidate(candidate.id, file);
      if (!result.ok) {
        toast.custom((t) => (
          <ToastCustomMessage
            title="Error al actualizar el CV"
            message="El CV no pudo ser actualizado"
            type="error"
            onClick={() => toast.dismiss(t)}
          />
        ));
        return;
      }

      toast.custom((t) => (
        <ToastCustomMessage
          title="CV actualizado exitosamente"
          message="El CV ha sido actualizado exitosamente"
          type="success"
          onClick={() => toast.dismiss(t)}
        />
      ));
    } catch (err) {
      toast.custom((t) => (
        <ToastCustomMessage
          title="Error al actualizar el CV"
          message="El CV no pudo ser actualizado"
          type="error"
          onClick={() => toast.dismiss(t)}
        />
      ));
    } finally {
      closeDialog();
      refreshCandidates();
    }
  };

  const handleSaveCV = async (file: File) => {
    if (!candidate?.id) return;

    try {
      if (candidate.cvFileId) {
        // Ya tiene CV, actualizar
        await handleUpdateCV(file);
      } else {
        // No tiene CV, subir nuevo
        await handleUploadNewCV(file);
      }
    } catch (error) {
      console.error("Error al procesar CV:", error);
    }
  };

  const handleDeleteCV = async () => {
    if (!candidate?.id || !candidate.cvFileId) return;

    try {
      const result = await deleteCvFromCandidate(candidate.id);
      if (!result?.ok) {
        toast.custom((t) => (
          <ToastCustomMessage
            title="Error al eliminar el CV"
            message="El CV no pudo ser eliminado"
            type="error"
            onClick={() => toast.dismiss(t)}
          />
        ));
        return;
      }

      toast.custom((t) => (
        <ToastCustomMessage
          title="CV eliminado exitosamente"
          message="El CV ha sido eliminado exitosamente"
          type="success"
          onClick={() => toast.dismiss(t)}
        />
      ));
    } catch (err) {
      console.error("Error al eliminar el CV:", err);
      toast.custom((t) => (
        <ToastCustomMessage
          title="Error al eliminar el CV"
          message="El CV no pudo ser eliminado"
          type="error"
          onClick={() => toast.dismiss(t)}
        />
      ));
    } finally {
      closeDialog();
      refreshCandidates();
    }
  };

  const currentCV = candidate?.cvFileId
    ? {
        id: candidate.cvFileId,
        url:
          typeof candidate.cv === "string"
            ? candidate.cv
            : (candidate.cv as any)?.url || "",
      }
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[70vh] overflow-y-auto z-[9999]">
        <DialogHeader>
          <DialogTitle>Editar candidato</DialogTitle>
          <DialogDescription>
            Modifica la información del candidato y guarda los cambios.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre completo *</FormLabel>
                  <FormControl>
                    <Input placeholder="Juan Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="555-123-4567" type="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="candidato@ejemplo.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo booleano: ¿Está empleado? */}
            <FormField
              control={form.control}
              name="esta_empleado"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel>¿Actualmente empleado?</FormLabel>
                  <FormControl>
                    <Switch
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sueldo y expectativa económica */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="sueldo_actual_o_ultimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sueldo actual o último</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. 20000" type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="expectativa_económica"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expectativa económica</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. 25000" type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Modalidad y ubicación último trabajo */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="modalidad_actual_o_ultima"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modalidad actual o última</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Presencial / Híbrido / Remoto"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="ubicacion_ultimo_trabajo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ubicación último trabajo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ciudad, País" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="bonos_comisiones"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bonos / Comisiones</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej. 10% comisión, bono anual, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Textareas para campos largos */}
            <FormField
              control={form.control}
              name="prestaciones_actuales_o_ultimas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prestaciones actuales o últimas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe prestaciones (vales, SGMM, vacaciones, etc.)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="direccion_actual"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección del candidato</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Calle, número, colonia, ciudad, estado"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="otros_beneficios"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Otros beneficios</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Beneficios adicionales" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar cambios"}
              </Button>
            </DialogFooter>
          </form>
        </Form>

        {/* Sección separada para manejo del CV */}
        <div className="border-t pt-4 mt-4">
          <CVUploadSection
            inputId="cv-edit-upload-kanban"
            currentCV={currentCV}
            onSaveCV={handleSaveCV}
            onDeleteCV={handleDeleteCV}
            disabled={isSubmitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
