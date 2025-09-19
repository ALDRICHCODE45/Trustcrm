"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFileUpload } from "@/hooks/use-file-upload";
import { createPerfilMuestraAction } from "@/actions/vacantes/files/actions";
import { toast } from "sonner";
import { ToastCustomMessage } from "@/components/ToastCustomMessage";
import { CloudUpload, FileText, UploadIcon, X } from "lucide-react";

interface CreatePerfilMuestraDialogProps {
  vacancyId: string;
  fetchDocuments: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function CreatePerfilMuestraDialog({
  vacancyId,
  fetchDocuments,
  isOpen,
  setIsOpen,
}: CreatePerfilMuestraDialogProps) {
  const [perfilName, setPerfilName] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const [fileUploadState, fileUploadActions] = useFileUpload({
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024, // 20MB
    accept: ".pdf,.docx,.doc,.txt,.xlsx,.xls,.pptx,.ppt",
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

  const handleSubmit = async () => {
    if (!perfilName.trim()) {
      toast.custom((t) => (
        <ToastCustomMessage
          title="Error"
          type="error"
          message="Por favor ingresa un nombre para el perfil muestra"
          onClick={() => toast.dismiss(t)}
        />
      ));
      return;
    }

    if (fileUploadState.files.length === 0) {
      toast.custom((t) => (
        <ToastCustomMessage
          title="Error"
          type="error"
          message="Por favor selecciona un archivo para subir"
          onClick={() => toast.dismiss(t)}
        />
      ));
      return;
    }

    setIsUploading(true);

    try {
      const perfilFile = fileUploadState.files[0]?.file as File;

      const response = await createPerfilMuestraAction({
        file: perfilFile,
        vacancyId: vacancyId,
        name: perfilName,
      });

      if (!response.ok) {
        toast.custom((t) => (
          <ToastCustomMessage
            title="Error"
            type="error"
            message={response.message || "Error al crear el perfil muestra"}
            onClick={() => toast.dismiss(t)}
          />
        ));
        return;
      }

      toast.custom((t) => (
        <ToastCustomMessage
          title="Perfil Muestra creado exitosamente"
          type="success"
          message="El perfil muestra ha sido subido correctamente"
          onClick={() => toast.dismiss(t)}
        />
      ));

      // Limpiar formulario
      setPerfilName("");
      fileUploadActions.clearFiles();
      setIsOpen(false);
      fetchDocuments();
    } catch (error) {
      console.error("Error al crear perfil muestra:", error);
      toast.custom((t) => (
        <ToastCustomMessage
          title="Error"
          type="error"
          message={
            error instanceof Error
              ? error.message
              : "Error al crear el perfil muestra"
          }
          onClick={() => toast.dismiss(t)}
        />
      ));
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setPerfilName("");
    fileUploadActions.clearFiles();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <CloudUpload />
          <span>Perfil Muestra</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="z-[999999999] flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b px-6 py-4 text-base">
            Crear Perfil Muestra
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 pt-4 pb-2">
          <DialogDescription className="text-sm text-muted-foreground">
            Sube un perfil muestra para esta vacante. Este archivo servirá como
            referencia para evaluar candidatos.
          </DialogDescription>
        </div>
        <div className="overflow-y-auto">
          <div className="px-6 pt-4 pb-6 space-y-4">
            {/* Campo nombre del perfil */}
            <div className="space-y-2">
              <Label htmlFor="perfil-name">Nombre del perfil muestra *</Label>
              <Input
                id="perfil-name"
                placeholder="Ej: Perfil Senior, Perfil Mid-Level, Competencias técnicas..."
                value={perfilName}
                onChange={(e) => setPerfilName(e.target.value)}
              />
            </div>

            {/* Campo de subida de archivos */}
            <div className="space-y-2">
              <Label htmlFor="perfil-upload">Archivo del perfil muestra</Label>
              {fileUploadState.files.length === 0 ? (
                <div
                  className="border-input bg-background hover:bg-accent flex w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-6 transition-colors"
                  onClick={() =>
                    document.getElementById("perfil-upload")?.click()
                  }
                >
                  <UploadIcon className="text-muted-foreground mb-2 h-6 w-6" />
                  <div className="text-muted-foreground text-sm">
                    Arrastra y suelta o haz clic para subir
                  </div>
                  <div className="text-muted-foreground/80 text-xs mt-1">
                    PDF, DOCX, TXT, XLSX, PPTX (máx. 20MB)
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {fileUploadState.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-md border border-purple-200 dark:border-purple-800"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
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
                      document.getElementById("perfil-upload")?.click()
                    }
                    className="w-full"
                  >
                    <UploadIcon className="h-4 w-4 mr-2" />
                    Cambiar archivo
                  </Button>
                </div>
              )}
              <input
                id="perfil-upload"
                type="file"
                className="sr-only"
                accept=".pdf,.docx,.doc,.txt,.xlsx,.xls,.pptx,.ppt"
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
          </div>
        </div>
        <DialogFooter className="border-t px-6 py-4">
          <Button
            type="button"
            variant="outline"
            disabled={isUploading}
            onClick={handleCancel}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isUploading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isUploading ? "Subiendo..." : "Crear Perfil Muestra"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
