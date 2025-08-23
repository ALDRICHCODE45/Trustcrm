import { useState, useEffect, useCallback } from "react";
import { Prisma } from "@prisma/client";
import {
  addFileToVacancy,
  deleteFileFromVacancy,
  createJobDescriptionAction,
  getVacancyFilesDetailed,
} from "@/actions/vacantes/files/actions";

interface AddDocumentData {
  title: string;
  file: File;
  authorId: string;
}

type VacancyFileWitOutRelations = Prisma.VacancyFileGetPayload<{
  select: {
    name: true;
    id: true;
    vacancyId: true;
    url: true;
    mimeType: true;
    size: true;
    createdAt: true;
    updatedAt: true;
    authorId: true;
  };
}>;

export interface JobDescriptionData {
  file: File;
}

/**
 * Hook personalizado para manejar documentos de una vacante
 * Proporciona un estado centralizado y acciones para gestionar documentos
 * siguiendo el mismo patrón que useComments y useCandidates
 *
 * @param vacancyId - ID opcional de la vacante. Si se proporciona, se obtienen los documentos automáticamente
 * @returns Objeto con estado de documentos y acciones para manipularlos
 */
export const useDocuments = (vacancyId?: string) => {
  const [documents, setDocuments] = useState<VacancyFileWitOutRelations[]>([]);
  const [perfilesMuestra, setPerfilesMuestra] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [jobDescription, setJobDescription] = useState<any | null>(null);

  /**
   * Obtiene la lista de documentos de la vacante
   */
  const fetchDocuments = useCallback(async () => {
    if (!vacancyId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Usar la función detallada que incluye perfiles muestra
      const response = await getVacancyFilesDetailed(vacancyId);
      if (!response.ok) {
        throw new Error(response.message || "Error al obtener documentos");
      }
      setDocuments(response.archivosGenerales || []);
      setPerfilesMuestra(response.perfilesMuestra || []);
      setJobDescription(response.jobDescription || null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al obtener documentos";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [vacancyId]);

  /**
   * Añade un nuevo documento y actualiza la lista local
   * @param documentData - Datos del documento a crear
   */
  const addDocument = async (documentData: AddDocumentData) => {
    if (!vacancyId) throw new Error("ID de vacante requerido");

    try {
      setIsUploading(true);
      setError(null);

      const response = await addFileToVacancy({
        name: documentData.title,
        file: documentData.file,
        authorId: documentData.authorId,
        vacancyId,
      });

      if (!response.ok) {
        throw new Error(response.message || "Error al subir el documento");
      }

      // Agregar el nuevo documento al inicio de la lista
      if (response.file) {
        setDocuments((prevDocuments) => [response.file!, ...prevDocuments]);
      }

      return response;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al subir el documento";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Elimina un documento y actualiza la lista local
   * @param documentId - ID del documento a eliminar
   */
  const deleteDocument = async (documentId: string) => {
    try {
      setIsDeleting(true);
      setError(null);

      const response = await deleteFileFromVacancy(documentId);

      if (!response.ok) {
        throw new Error(response.message || "Error al eliminar el documento");
      }

      // Remover el documento de la lista local
      setDocuments((prevDocuments) =>
        prevDocuments.filter((doc) => doc.id !== documentId)
      );

      return response;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al eliminar el documento";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Abre/descarga un documento
   * @param fileUrl - URL del archivo
   * @param fileName - Nombre del archivo
   */
  const downloadDocument = (fileUrl: string, fileName: string) => {
    window.open(fileUrl, "_blank");
  };

  /**
   * Refresca la lista de documentos
   */
  const refreshDocuments = async () => {
    await fetchDocuments();
  };

  const createJobDescription = useCallback(
    async ({ file }: JobDescriptionData) => {
      if (!vacancyId) {
        setError("Datos incompletos");
        return {
          ok: false,
        };
      }

      setIsUploading(true);
      setError(null);

      try {
        //llamar a la funcion para crear el job description
        const response = await createJobDescriptionAction({
          file,
          vacancyId,
        });

        if (!response.ok) {
          setError(response.message || "Error al crear el JobDescription");
          return {
            ok: false,
          };
        }

        //actualizar la lista de documentos
        await fetchDocuments();

        return {
          ok: true,
        };
      } catch (e) {
        setError("No se pudo crear el JobDescription");
      } finally {
        setIsUploading(false);
      }
    },
    [vacancyId]
  );

  // Auto-fetch documents when vacancyId changes
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    // Estado
    documents,
    perfilesMuestra,
    isLoading,
    error,
    isUploading,
    isDeleting,
    jobDescription,

    // Acciones
    fetchDocuments,
    createJobDescription,
    addDocument,
    deleteDocument,
    downloadDocument,
    refreshDocuments,
  };
};
