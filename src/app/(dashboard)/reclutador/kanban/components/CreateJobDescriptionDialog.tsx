"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Plus, Upload, FileText, X, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useFileUpload, formatBytes } from "@/hooks/use-file-upload";
import { JobDescriptionData } from "@/hooks/documents/use-documents";

interface Props {
  fetchDocuments: () => void;
  createJobDescription: (jobDescription: JobDescriptionData) => void;
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

export const CreateJobDescriptionDialog = ({
  fetchDocuments,
  createJobDescription,
  isOpen,
  setIsOpen,
}: Props) => {
  const [isUploading, setIsUploading] = useState(false);
  const [jobDescriptionName] = useState("Job Description");

  const [fileState, fileActions] = useFileUpload({
    maxFiles: 1,
    maxSize: 30 * 1024 * 1024, // 30MB
    accept: ".pdf,.doc,.docx",
    multiple: false,
  });

  const getFileIcon = (fileType: string) => {
    if (fileType === "application/pdf") {
      return <FileText className="h-8 w-8 text-red-500" />;
    }
    return <FileText className="h-8 w-8 text-blue-500" />;
  };

  const handleSubmit = async () => {
    if (fileState.files.length === 0) {
      return;
    }

    setIsUploading(true);
    try {
      const data = {
        file: fileState.files[0].file,
      };
      createJobDescription(data as unknown as JobDescriptionData);
      fetchDocuments();
      fileActions.clearFiles();
    } catch (error) {
      console.error("Error al subir el archivo:", error);
    } finally {
      setIsUploading(false);
      setIsOpen?.(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> <span>Añadir Job Description</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="z-[9999] max-w-2xl">
        <DialogHeader>
          <DialogTitle>Añadir Job Description</DialogTitle>
          <DialogDescription>
            Sube un archivo PDF o Word que contenga el Job Description de la
            vacante.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Área de drag & drop */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
              fileState.isDragging
                ? "border-primary bg-primary/5"
                : "border-gray-300 hover:border-gray-400",
              fileState.files.length > 0 && "border-green-300 bg-green-50/50"
            )}
            onDragEnter={fileActions.handleDragEnter}
            onDragLeave={fileActions.handleDragLeave}
            onDragOver={fileActions.handleDragOver}
            onDrop={fileActions.handleDrop}
            onClick={fileActions.openFileDialog}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 rounded-full bg-gray-100">
                <Upload className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Arrastra tu archivo aquí o{" "}
                  <span className="text-primary">
                    haz clic para seleccionar
                  </span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, DOC, DOCX hasta 10MB
                </p>
              </div>
            </div>
          </div>

          {/* Input file oculto */}
          <input {...fileActions.getInputProps()} className="hidden" />

          {/* Archivo seleccionado */}
          {fileState.files.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900">
                Archivo seleccionado
              </h4>
              <div className="space-y-2">
                {fileState.files.map((fileWithPreview) => {
                  const file = fileWithPreview.file;
                  const fileType = file instanceof File ? file.type : file.type;
                  const fileName = file instanceof File ? file.name : file.name;
                  const fileSize = file instanceof File ? file.size : file.size;

                  return (
                    <div
                      key={fileWithPreview.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border"
                    >
                      {getFileIcon(fileType)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {fileName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatBytes(fileSize)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          fileActions.removeFile(fileWithPreview.id)
                        }
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mensajes de error */}
          {fileState.errors.length > 0 && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700">
                {fileState.errors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={fileState.files.length === 0 || isUploading}
              className="flex-1"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Subir archivo
                </>
              )}
            </Button>
            {fileState.files.length > 0 && (
              <Button variant="outline" onClick={fileActions.clearFiles}>
                Limpiar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
``;
