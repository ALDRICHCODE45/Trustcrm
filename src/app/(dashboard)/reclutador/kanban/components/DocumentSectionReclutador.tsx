"use client";
import { useState } from "react";
import { VacancyWithRelations } from "../../components/ReclutadorColumns";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useDocuments } from "@/hooks/documents/use-documents";
import { toast } from "sonner";
import { ToastCustomMessage } from "@/components/ToastCustomMessage";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Download,
  FileSymlink,
  FileText,
  MoreVertical,
  Plus,
  Trash,
  UploadIcon,
  X,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTrigger,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DocumentsSectionProps {
  vacante: VacancyWithRelations;
}

export const DocumentsSectionReclutador: React.FC<DocumentsSectionProps> = ({
  vacante,
}) => {
  const [open, setOpen] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Hook personalizado para manejar documentos
  const {
    documents,
    isLoading,
    error,
    isUploading,
    isDeleting,
    addDocument,
    deleteDocument,
    downloadDocument,
  } = useDocuments(vacante.id);

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
    if (!documentTitle.trim()) {
      toast.custom((t) => (
        <ToastCustomMessage
          title="Error"
          type="error"
          message="Por favor ingresa un título para el documento"
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

    try {
      const documentFile = fileUploadState.files[0]?.file as File;

      await addDocument({
        title: documentTitle,
        file: documentFile,
        authorId: vacante.reclutador?.id || "",
      });

      toast.custom((t) => (
        <ToastCustomMessage
          title="Documento subido exitosamente"
          type="success"
          message="El documento ha sido subido exitosamente"
          onClick={() => toast.dismiss(t)}
        />
      ));

      // Limpiar formulario
      setDocumentTitle("");
      fileUploadActions.clearFiles();
      setOpen(false);
    } catch (error) {
      console.error("Error al subir documento:", error);
      toast.custom((t) => (
        <ToastCustomMessage
          title="Error"
          type="error"
          message={
            error instanceof Error
              ? error.message
              : "Error al subir el documento"
          }
          onClick={() => toast.dismiss(t)}
        />
      ));
    }
  };

  const handleDeleteDocument = async (fileId: string) => {
    try {
      await deleteDocument(fileId);
      toast.custom((t) => (
        <ToastCustomMessage
          title="Archivo eliminado correctamente"
          type="success"
          message="El documento ha sido eliminado exitosamente"
          onClick={() => toast.dismiss(t)}
        />
      ));
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error(error);
      toast.custom((t) => (
        <ToastCustomMessage
          title="Error"
          type="error"
          message={
            error instanceof Error
              ? error.message
              : "Error al eliminar el archivo"
          }
          onClick={() => toast.dismiss(t)}
        />
      ));
    }
  };

  // Función para formatear el tamaño del archivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Función para obtener el tipo de archivo desde el mimeType
  const getFileTypeFromMimeType = (mimeType: string): string => {
    if (mimeType.includes("pdf")) return "PDF";
    if (mimeType.includes("word") || mimeType.includes("document"))
      return "DOCX";
    if (mimeType.includes("excel") || mimeType.includes("sheet")) return "XLSX";
    if (mimeType.includes("powerpoint") || mimeType.includes("presentation"))
      return "PPTX";
    if (mimeType.includes("text")) return "TXT";
    return "DOC";
  };

  // Función para formatear la fecha
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  if (isLoading) {
    return (
      <div className="space-y-6 mt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Documentos</h3>
        </div>
        <div className="flex justify-center items-center py-8">
          <div className="text-muted-foreground">Cargando documentos...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 mt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Documentos</h3>
        </div>
        <div className="flex justify-center items-center py-8">
          <div className="text-destructive">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Documentos</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> <span>Añadir documento</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="z-[9999] flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
            <DialogHeader className="contents space-y-0 text-left">
              <DialogTitle className="border-b px-6 py-4 text-base">
                Añadir documento
              </DialogTitle>
            </DialogHeader>
            <div className="px-6 pt-4 pb-2">
              <p className="text-sm text-muted-foreground">
                Sube un documento relacionado con esta vacante. Ingresa un
                título descriptivo y selecciona el archivo.
              </p>
            </div>
            <div className="overflow-y-auto">
              <div className="px-6 pt-4 pb-6 space-y-4">
                {/* Campo título del documento */}
                <div className="space-y-2">
                  <Label htmlFor="document-title">Título del documento *</Label>
                  <Input
                    id="document-title"
                    placeholder="Ej: Descripción del puesto, Contrato tipo, etc."
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                  />
                </div>

                {/* Campo de subida de archivos */}
                <div className="space-y-2">
                  <Label htmlFor="document-upload">Archivo del documento</Label>
                  {fileUploadState.files.length === 0 ? (
                    <div
                      className="border-input bg-background hover:bg-accent flex w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-6 transition-colors"
                      onClick={() =>
                        document.getElementById("document-upload")?.click()
                      }
                    >
                      <UploadIcon className="text-muted-foreground mb-2 h-6 w-6" />
                      <div className="text-muted-foreground text-sm">
                        Arrastra y suelta o haz clic para subir
                      </div>
                      <div className="text-muted-foreground/80 text-xs mt-1">
                        PDF, DOCX, TXT, XLSX, PPTX (máx. 10MB)
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
                          document.getElementById("document-upload")?.click()
                        }
                        className="w-full"
                      >
                        <UploadIcon className="h-4 w-4 mr-2" />
                        Cambiar archivo
                      </Button>
                    </div>
                  )}
                  <input
                    id="document-upload"
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
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isUploading}
              >
                {isUploading ? "Subiendo..." : "Subir documento"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Documentos existentes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {documents && documents.length > 0 ? (
          documents.map((file) => (
            <Card
              key={file.id}
              className="group hover:shadow-md transition-all duration-200"
            >
              <CardContent className="p-5">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="z-[9999]">
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => downloadDocument(file.url, file.name)}
                        >
                          <FileSymlink className="mr-2" />
                          <span>Ver</span>
                        </DropdownMenuItem>
                        <AlertDialog
                          open={openDeleteDialog}
                          onOpenChange={setOpenDeleteDialog}
                        >
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              className="text-red-500 cursor-pointer"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              <span>Eliminar</span>
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="z-[9999]">
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                ¿Estás seguro de querer eliminar este documento?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará
                                el documento permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteDocument(file.id)}
                                disabled={isDeleting}
                              >
                                {isDeleting ? "Eliminando..." : "Eliminar"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="font-medium text-lg mb-1 max-w-[130px] truncate">
                          {file.name}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">{file.name}</p>
                      </TooltipContent>
                    </Tooltip>
                    <div className="text-sm text-muted-foreground">
                      Actualizado el {formatDate(file.updatedAt)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant="outline"
                      className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                    >
                      {getFileTypeFromMimeType(file.mimeType)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadDocument(file.url, file.name)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    <span>Descargar</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              No hay documentos asociados a esta vacante
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
