"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createCandidateSchema,
  CreateCandidateFormData,
} from "@/zod/createCandidateSchema";
import { useFileUpload, FileMetadata } from "@/hooks/use-file-upload";
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
import { Label } from "@/components/ui/label";
import { UploadIcon, FileText, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface CreateCandidateFormProps {
  vacancyId: string;
  onCandidateCreated: (
    candidateData: CreateCandidateFormData & {
      cvFile?: File | FileMetadata | undefined;
    }
  ) => void;
  onCancel: () => void;
}

export const CreateCandidateForm = ({
  vacancyId,
  onCandidateCreated,
  onCancel,
}: CreateCandidateFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateCandidateFormData>({
    resolver: zodResolver(createCandidateSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      cvFile: undefined,
      //campos extra
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

  const [fileUploadState, fileUploadActions] = useFileUpload({
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    accept: ".pdf,.docx,.doc,.txt",
    multiple: false,
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      fileUploadActions.addFiles(files);
    }
  };

  const removeFile = (fileId: string) => {
    fileUploadActions.removeFile(fileId);
  };

  const onSubmit = async (data: CreateCandidateFormData) => {
    setIsSubmitting(true);
    try {
      // Limpiar campos vacíos antes de enviar
      const cleanData: CreateCandidateFormData = {
        name: data.name,
        phone: data.phone?.trim() || undefined,
        email: data.email?.trim() || undefined,
        esta_empleado: data.esta_empleado,
        sueldo_actual_o_ultimo:
          data.sueldo_actual_o_ultimo?.toString().trim() || undefined,
        prestaciones_actuales_o_ultimas:
          data.prestaciones_actuales_o_ultimas?.trim() || undefined,
        bonos_comisiones: data.bonos_comisiones?.trim() || undefined,
        otros_beneficios: data.otros_beneficios?.trim() || undefined,
        expectativa_económica:
          data.expectativa_económica?.toString().trim() || undefined,
        direccion_actual: data.direccion_actual?.trim() || undefined,
        modalidad_actual_o_ultima:
          data.modalidad_actual_o_ultima?.trim() || undefined,
        ubicacion_ultimo_trabajo:
          data.ubicacion_ultimo_trabajo?.trim() || undefined,
        cvFile: data.cvFile,
      };

      // Agregar archivo CV si existe
      const cvFile = fileUploadState.files[0]?.file || undefined;

      const dataWithFile = {
        ...cleanData,
        cvFile,
      };

      // Pasar los datos al hook para que maneje la creación
      onCandidateCreated(dataWithFile);

      // Reset del formulario solo si la creación fue exitosa
      form.reset();
      fileUploadActions.clearFiles();
    } catch (error) {
      // El error ya se maneja en el hook/componente padre
      console.error("Error en el formulario:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="flex flex-col gap-4 sm:flex-row ">
          <div className="flex-1">
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
          </div>
          <div className="flex-1">
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
          </div>
        </div>

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

        {/* Modalidades y ubicación último trabajo */}
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
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
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
          <div className="flex-1">
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
          </div>
        </div>

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
              <FormLabel>Dirección actual</FormLabel>
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
                <Textarea
                  placeholder="Beneficios adicionales relevantes"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <Label htmlFor="cv-upload-create">Curriculum Vitae (CV)</Label>
          {fileUploadState.files.length === 0 ? (
            <div
              className="border-input bg-background hover:bg-accent flex w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-6 transition-colors"
              onClick={() =>
                document.getElementById("cv-upload-create")?.click()
              }
            >
              <UploadIcon className="text-muted-foreground mb-2 h-6 w-6" />
              <div className="text-muted-foreground text-sm">
                Arrastra y suelta o haz clic para subir
              </div>
              <div className="text-muted-foreground/80 text-xs mt-1">
                PDF, DOCX o TXT (máx. 5MB)
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {fileUploadState.files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md border"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium truncate">
                      {file.file.name}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  document.getElementById("cv-upload-create")?.click()
                }
                className="w-full"
              >
                <UploadIcon className="h-4 w-4 mr-2" />
                Cambiar archivo
              </Button>
            </div>
          )}
          <input
            id="cv-upload-create"
            type="file"
            className="sr-only"
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleFileUpload}
          />
          {fileUploadState.errors.length > 0 && (
            <div className="text-sm text-red-600">
              {fileUploadState.errors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? "Guardando..." : "Guardar candidato"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
