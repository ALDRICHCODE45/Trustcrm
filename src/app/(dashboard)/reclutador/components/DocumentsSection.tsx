"use client";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
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
  UploadIcon,
  FileText,
  X,
  CloudUpload,
  MoreVertical,
  Trash,
  Download,
  FileSymlink,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useDocuments } from "@/hooks/documents/use-documents";
import { toast } from "sonner";
import { ToastCustomMessage } from "@/components/ToastCustomMessage";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CreateJobDescriptionDialog } from "../kanban/components/CreateJobDescriptionDialog";
import { CreatePerfilMuestraDialog } from "../kanban/components/CreatePerfilMuestraDialog";
import { deleteJobDescriptionAction } from "@/actions/vacantes/files/actions";

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
  const [sheetOpen, setSheetOpen] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openCreateJobDescriptionDialog, setOpenCreateJobDescriptionDialog] =
    useState<boolean>(false);
  const [openCreatePerfilMuestraDialog, setOpenCreatePerfilMuestraDialog] =
    useState<boolean>(false);

  // Usar useRef para mantener el vacancyId consistente
  const vacancyIdRef = useRef<string>(vacante.id);
  const reclutadorIdRef = useRef<string>(vacante.reclutador?.id || "");

  // Efecto para actualizar el vacancyId solo cuando el sheet está cerrado
  useEffect(() => {
    if (!sheetOpen) {
      vacancyIdRef.current = vacante.id;
      reclutadorIdRef.current = vacante.reclutador?.id || "";
    }
  }, [vacante.id, vacante.reclutador?.id, sheetOpen]);

  // Hook personalizado para manejar documentos usando el ID consistente
  const {
    documents,
    perfilesMuestra,
    isLoading,
    error,
    isUploading,
    isDeleting,
    addDocument,
    deleteDocument,
    createJobDescription,
    downloadDocument,
    fetchDocuments,
    jobDescription,
  } = useDocuments(vacancyIdRef.current);

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

  // Función de submit memoizada para evitar recreaciones y usar el ID consistente
  const handleSubmit = useCallback(async () => {
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

      // Usar el vacancyId del ref para asegurar consistencia
      await addDocument({
        title: documentTitle,
        file: documentFile,
        authorId: reclutadorIdRef.current,
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
  }, [documentTitle, fileUploadState.files, addDocument, fileUploadActions]);

  const handleDeleteDocument = useCallback(
    async (fileId: string) => {
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
    },
    [deleteDocument]
  );

  const handleDeleteJobDescription = useCallback(async () => {
    try {
      if (!jobDescription?.id) {
        toast.custom((t) => (
          <ToastCustomMessage
            title="Error"
            type="error"
            message="No se encontró el ID del JobDescription"
            onClick={() => toast.dismiss(t)}
          />
        ));
        return;
      }
      // Usar el vacancyId del ref para asegurar consistencia
      const response = await deleteJobDescriptionAction(
        vacancyIdRef.current,
        jobDescription.id
      );
      if (!response.ok) {
        toast.custom((t) => (
          <ToastCustomMessage
            title="Error"
            type="error"
            message="Error al eliminar el JobDescription"
            onClick={() => toast.dismiss(t)}
          />
        ));
        return;
      }
      toast.custom((t) => (
        <ToastCustomMessage
          title="JobDescription eliminado correctamente"
          type="success"
          message="El JobDescription ha sido eliminado correctamente"
          onClick={() => toast.dismiss(t)}
        />
      ));
      fetchDocuments();
      setOpenDeleteDialog(false);
    } catch (e) {
      toast.custom((t) => (
        <ToastCustomMessage
          title="Error No controlado"
          type="error"
          message="Reinicie su sesion o hable con el area de TI para resolver el problema"
          onClick={() => toast.dismiss(t)}
        />
      ));
    }
  }, [jobDescription, fetchDocuments]);

  const handleReplaceJobDescription = useCallback(() => {
    setOpenCreateJobDescriptionDialog(true);
  }, []);

  const handleDeletePerfilMuestra = useCallback(
    async (perfilMuestraId: string) => {
      try {
        if (!perfilMuestraId) {
          toast.custom((t) => (
            <ToastCustomMessage
              title="Error"
              type="error"
              message="No se encontró el ID del perfil muestra"
              onClick={() => toast.dismiss(t)}
            />
          ));
          return;
        }
        await handleDeleteDocument(perfilMuestraId);
        toast.custom((t) => (
          <ToastCustomMessage
            title="Perfil muestra eliminado correctamente"
            type="success"
            message="El perfil muestra ha sido eliminado correctamente"
            onClick={() => toast.dismiss(t)}
          />
        ));
        fetchDocuments();
      } catch (e) {
        toast.custom((t) => (
          <ToastCustomMessage
            title="Error No controlado"
            type="error"
            message="Reinicie su sesion o hable con el area de TI para resolver el problema"
            onClick={() => toast.dismiss(t)}
          />
        ));
      }
    },
    [handleDeleteDocument, fetchDocuments]
  );

  // Handlers memoizados para evitar recreaciones
  const handleSheetOpenChange = useCallback((newOpen: boolean) => {
    setSheetOpen(newOpen);
    if (!newOpen) {
      setOpen(false);
      setOpenCreateJobDescriptionDialog(false);
      setOpenCreatePerfilMuestraDialog(false);
    }
  }, []);

  const handleDialogOpenChange = useCallback(
    (newOpen: boolean) => {
      setOpen(newOpen);
      if (!newOpen) {
        setDocumentTitle("");
        fileUploadActions.clearFiles();
      }
    },
    [fileUploadActions]
  );

  if (isLoading) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <File className="text-gray-600" />
          </Button>
        </SheetTrigger>
        <SheetContent className="min-w-[26vw]">
          <SheetHeader>
            <SheetTitle>Documentos</SheetTitle>
          </SheetHeader>
          <div className="flex justify-center items-center py-8">
            <div className="text-muted-foreground">Cargando documentos...</div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (error) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <File className="text-gray-600" />
          </Button>
        </SheetTrigger>
        <SheetContent className="min-w-[26vw]">
          <SheetHeader>
            <SheetTitle>Documentos</SheetTitle>
          </SheetHeader>
          <div className="flex justify-center items-center py-8">
            <div className="text-destructive">Error: {error}</div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <>
      <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <File className="text-gray-600" />
          </Button>
        </SheetTrigger>
        <SheetContent className="min-w-[26vw]">
          <SheetHeader>
            <SheetTitle>Documentos</SheetTitle>
            <div className="flex items-center gap-2 pt-4">
              <CreateJobDescriptionDialog
                fetchDocuments={fetchDocuments}
                createJobDescription={createJobDescription}
                isOpen={openCreateJobDescriptionDialog}
                setIsOpen={setOpenCreateJobDescriptionDialog}
              />
              <CreatePerfilMuestraDialog
                vacancyId={vacancyIdRef.current}
                fetchDocuments={fetchDocuments}
                isOpen={openCreatePerfilMuestraDialog}
                setIsOpen={setOpenCreatePerfilMuestraDialog}
              />
              <Dialog open={open} onOpenChange={handleDialogOpenChange}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <CloudUpload />
                    <span>Documento Extra</span>
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </SheetHeader>

          {/* Documentos existentes */}
          <div className="mt-6 space-y-4 overflow-y-auto h-[calc(100vh-200px)] ">
            {/* Job Description y Perfiles Muestra */}
            {(jobDescription ||
              (perfilesMuestra && perfilesMuestra.length > 0)) && (
              <div className="mb-6 space-y-4">
                {/* Job Description */}
                {jobDescription && (
                  <Card className="group hover:shadow-md transition-all duration-200 border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="z-[9999]"
                            >
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={handleReplaceJobDescription}
                              >
                                <UploadIcon className="mr-2" />
                                <span>Reemplazar</span>
                              </DropdownMenuItem>
                              <AlertDialog>
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
                                      ¿Estás seguro de querer eliminar el Job
                                      Description?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta acción no se puede deshacer. Se
                                      eliminará el Job Description
                                      permanentemente de esta vacante.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancelar
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={handleDeleteJobDescription}
                                      disabled={isDeleting}
                                    >
                                      {isDeleting
                                        ? "Eliminando..."
                                        : "Eliminar"}
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
                              <div className="font-medium text-base mb-1 max-w-[200px] truncate">
                                {jobDescription.name}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="z-[9999]">
                              <p className="text-sm">{jobDescription.name}</p>
                            </TooltipContent>
                          </Tooltip>
                          <div className="text-sm text-muted-foreground">
                            Actualizado el{" "}
                            {formatDate(jobDescription.updatedAt)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant="outline"
                            className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                          >
                            JD •{" "}
                            {getFileTypeFromMimeType(jobDescription.mimeType)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(jobDescription.size)}
                          </span>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            downloadDocument(
                              jobDescription.url,
                              jobDescription.name
                            )
                          }
                        >
                          <Download className="h-4 w-4 mr-2" />
                          <span>Ver JD</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Perfiles Muestra */}
                {perfilesMuestra &&
                  perfilesMuestra.map((perfil: any) => (
                    <Card
                      key={perfil.id}
                      className="group hover:shadow-md transition-all duration-200 border-l-4 border-l-purple-500"
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-3">
                          <div className="flex justify-between items-start">
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                              <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="z-[9999]"
                              >
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  onClick={() =>
                                    downloadDocument(perfil.url, perfil.name)
                                  }
                                >
                                  <FileSymlink className="mr-2" />
                                  <span>Ver</span>
                                </DropdownMenuItem>
                                <AlertDialog>
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
                                        ¿Estás seguro de querer eliminar este
                                        Perfil Muestra?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Esta acción no se puede deshacer. Se
                                        eliminará el Perfil Muestra
                                        permanentemente de esta vacante.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancelar
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleDeletePerfilMuestra(perfil.id)
                                        }
                                        disabled={isDeleting}
                                      >
                                        {isDeleting
                                          ? "Eliminando..."
                                          : "Eliminar"}
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
                                <div className="font-medium text-base mb-1 max-w-[200px] truncate">
                                  {perfil.name}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="z-[9999]">
                                <p className="text-sm">{perfil.name}</p>
                              </TooltipContent>
                            </Tooltip>
                            <div className="text-sm text-muted-foreground">
                              Actualizado el {formatDate(perfil.updatedAt)}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mt-2">
                            <Badge
                              variant="outline"
                              className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800"
                            >
                              PM • {getFileTypeFromMimeType(perfil.mimeType)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatFileSize(perfil.size)}
                            </span>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              downloadDocument(perfil.url, perfil.name)
                            }
                          >
                            <Download className="h-4 w-4 mr-2" />
                            <span>Ver Perfil</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}

            {/* Documentos regulares */}
            {documents && documents.length > 0
              ? documents.map((file) => (
                  <Card
                    key={file.id}
                    className="group hover:shadow-md transition-all duration-200"
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="z-[9999]"
                            >
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() =>
                                  downloadDocument(file.url, file.name)
                                }
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
                                      ¿Estás seguro de querer eliminar este
                                      documento?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta acción no se puede deshacer. Se
                                      eliminará el documento permanentemente.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancelar
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDeleteDocument(file.id)
                                      }
                                      disabled={isDeleting}
                                    >
                                      {isDeleting
                                        ? "Eliminando..."
                                        : "Eliminar"}
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
                              <div className="font-medium text-base mb-1 max-w-[200px] truncate">
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
              : !jobDescription &&
                (!perfilesMuestra || perfilesMuestra.length === 0) && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      No hay documentos asociados a esta vacante
                    </p>
                  </div>
                )}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
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
                      PDF, DOCX, TXT, XLSX, PPTX (máx. 20MB)
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
              <Button type="button" variant="outline" disabled={isUploading}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleSubmit} disabled={isUploading}>
              {isUploading ? "Subiendo..." : "Subir documento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
