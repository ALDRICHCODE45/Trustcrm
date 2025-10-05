"use client";
import { AlertCircleIcon, ImageUpIcon, XIcon, UploadIcon } from "lucide-react";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useState } from "react";
import { uploadFile } from "@/actions/files/actions";
import { editUser } from "@/actions/users/create-user";
import { toast } from "sonner";
import Image from "next/image";

interface Props {
  userId: string;
}

export default function UploadProfileImage({ userId }: Props) {
  const maxSizeMB = 10;
  const maxSize = maxSizeMB * 1024 * 1024; // 10MB default
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    url?: string;
    error?: string;
  } | null>(null);

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    accept: "image/*",
    maxSize,
    multiple: false, // Aseguramos que sea single file
  });

  const previewUrl = files[0]?.preview || null;
  const currentFile = files[0]?.file; // Aquí está tu archivo

  const handleUpload = async () => {
    // Verificar que currentFile sea un File real, no FileMetadata
    if (!currentFile || !(currentFile instanceof File)) {
      console.error("No hay archivo válido para subir");
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      // Crear FormData con el archivo
      const formData = new FormData();
      formData.append("file", currentFile);

      // Llamar a tu función uploadFile
      const { url } = await uploadFile(formData);
      const ImageFormData = new FormData();
      ImageFormData.append("image", url!);

      const userUpdatedResult = await editUser(userId, ImageFormData);

      setUploadResult({ success: true, url });
      toast.success("Imagen actualizada correctamente");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      setUploadResult({ success: false, error: errorMessage });
      toast.error("Error al actualizar imagen");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        {/* Drop area */}
        <div
          role="button"
          onClick={openFileDialog}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          data-dragging={isDragging || undefined}
          className="border-input "
        >
          <input
            {...getInputProps()}
            className="sr-only"
            aria-label="Upload file"
          />
          {previewUrl ? (
            <div className="absolute inset-0">
              <Image
                src={previewUrl}
                alt={
                  currentFile instanceof File
                    ? currentFile.name
                    : "Uploaded image"
                }
                className="size-full object-cover"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
              <div
                className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                aria-hidden="true"
              >
                <ImageUpIcon className="size-4 opacity-60" />
              </div>
              <p className="mb-1.5 text-sm font-medium">
                Arrastra tu imagen aquí o haz clic para buscar
              </p>
              <p className="text-muted-foreground text-xs">
                Tamaño máximo: {maxSizeMB} MB
              </p>
            </div>
          )}
        </div>
        {previewUrl && (
          <div className="absolute top-4 right-4">
            <button
              type="button"
              className="focus-visible:border-ring focus-visible:ring-ring/50 z-50 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]"
              onClick={() => removeFile(files[0]?.id)}
              aria-label="Remove image"
            >
              <XIcon className="size-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {/* Botón para subir archivo - solo mostrar si hay un archivo File válido */}
      {currentFile && currentFile instanceof File && (
        <div className="flex flex-col gap-2">
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UploadIcon className="size-4" />
            {isUploading ? "Subiendo..." : "Subir Imagen"}
          </button>

          {/* Info del archivo */}
          <div className="text-xs text-gray-600 text-center">
            {currentFile.name} ({Math.round(currentFile.size / 1024)} KB)
          </div>
        </div>
      )}

      {/* Mostrar resultado del upload */}
      {uploadResult && (
        <div
          className={`p-3 rounded-lg text-sm ${
            uploadResult.success
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {uploadResult.success ? (
            <div className="space-y-1">
              <p className="font-medium">¡Imagen subida exitosamente!</p>
              <p className="text-xs break-all opacity-75">
                URL: {uploadResult.url}
              </p>
            </div>
          ) : (
            <p className="font-medium">Error: {uploadResult.error}</p>
          )}
        </div>
      )}

      {errors.length > 0 && (
        <div
          className="text-destructive flex items-center gap-1 text-xs"
          role="alert"
        >
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}
    </div>
  );
}
