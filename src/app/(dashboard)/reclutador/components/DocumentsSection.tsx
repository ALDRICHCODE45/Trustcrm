"use client";
import {
  SheetTrigger,
  Sheet,
  SheetContent,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet";

import { VacancyWithRelations } from "./ReclutadorColumns";
import { Button } from "@/components/ui/button";
import {
  File,
  Plus,
  UploadIcon,
  FileText,
  X,
  CloudUpload,
  CircleCheckIcon,
  XIcon,
  MoreVertical,
  Download,
  Edit,
  Trash,
  Eye,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useFileUpload } from "@/hooks/use-file-upload";
import { toast, ToastT } from "sonner";
import {
  addFileToVacancy,
  deleteFileFromVacancy,
} from "@/actions/vacantes/files/actions";
import { ToastCustomMessage } from "@/components/ToastCustomMessage";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AlertDialog } from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  if (mimeType.includes("word") || mimeType.includes("document")) return "DOCX";
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

export const DocumentsSection = ({
  vacante,
}: {
  vacante: VacancyWithRelations;
}) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [fileUploadState, fileUploadActions] = useFileUpload({
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
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
      toast.error("Por favor ingresa un título para el documento");
      return;
    }

    if (fileUploadState.files.length === 0) {
      toast.error("Por favor selecciona un archivo para subir");
      return;
    }

    setIsSubmitting(true);

    try {
      // Aquí irá la llamada al servidor - por ahora la dejo vacía
      const documentFile = fileUploadState.files[0]?.file as File;
      const documentData = {
        title: documentTitle,
        file: documentFile,
        vacancyId: vacante.id,
        authorId: vacante.reclutador.id,
      };
      const response = await addFileToVacancy({
        ...documentData,
        name: documentData.title,
      });

      if (!response?.ok) {
        toast.error(response?.message || "Error al subir el documento");
        console.error("error", response);
        return;
      }

      toast.custom((t) => (
        <ToastCustomMessage
          title={response.message || "Documento subido exitosamente"}
          type="success"
          message={
            response.message || "El documento ha sido subido exitosamente"
          }
          onClick={() => toast.dismiss(t)}
        />
      ));

      // Limpiar formulario
      setDocumentTitle("");
      fileUploadActions.clearFiles();
      setOpen(false);
    } catch (error) {
      console.error("Error al subir documento:", error);
      toast.error("Error al subir el documento");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Funciones para las acciones de los documentos (por implementar)
  const handleDownloadDocument = (fileUrl: string, fileName: string) => {
    // TODO: Implementar descarga de documento
    console.log("Descargar:", fileName, fileUrl);
    // Abrir en nueva pestaña por ahora
    window.open(fileUrl, "_blank");
  };

  const handleEditDocument = (fileId: string) => {
    // TODO: Implementar edición de documento
    console.log("Editar documento:", fileId);
    toast.info("Funcionalidad de edición en desarrollo");
  };

  const handleDeleteDocument = async (fileId: string) => {
    try {
      const response = await deleteFileFromVacancy(fileId);
      if (!response?.ok) {
        toast.error(response?.message || "Error al eliminar el archivo");
        return;
      }
      toast.custom((t) => (
        <ToastCustomMessage
          title={response.message}
          type="success"
          message={response.message}
          onClick={() => toast.dismiss(t)}
        />
      ));
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar el archivo");
    }
  };

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <File className="text-gray-600" />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle></SheetTitle>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <CloudUpload className="text-gray-500" />
                  Añadir documento
                </Button>
              </DialogTrigger>
            </Dialog>
          </SheetHeader>

          {/* Documentos existentes */}
          <div className="mt-6 space-y-4 overflow-y-auto h-[calc(100vh-200px)]">
            {vacante.files && vacante.files.length > 0 ? (
              vacante.files.map((file) => (
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
                              onClick={() =>
                                handleDownloadDocument(file.url, file.name)
                              }
                            >
                              <Eye />
                              <span>Ver</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => handleEditDocument(file.id)}
                            >
                              <Edit />
                              <span>Editar</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-500 cursor-pointer"
                              onClick={() => setOpenDeleteDialog(true)}
                            >
                              <Trash />
                              <span>Eliminar</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <AlertDialog
                        open={openDeleteDialog}
                        onOpenChange={setOpenDeleteDialog}
                      >
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              ¿Estás seguro de querer eliminar este documento?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará el
                              documento permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteDocument(file.id)}
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

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
                        onClick={() =>
                          handleDownloadDocument(file.url, file.name)
                        }
                      >
                        <ExternalLink />
                        <span>Visualizar</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  No hay documentos extra asociados a esta vacante
                </p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
          <DialogHeader className="contents space-y-0 text-left">
            <DialogTitle className="border-b px-6 py-4 text-base">
              Añadir documento
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="sr-only">
            Completar la información del nuevo documento.
          </DialogDescription>
          <div className="px-6 pt-4 pb-2">
            <p className="text-sm text-muted-foreground">
              Sube un documento relacionado con esta vacante. Ingresa un título
              descriptivo y selecciona el archivo.
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
                      PDF, DOCX, TXT(máx. 30MB)
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
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Subiendo..." : "Subir documento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
