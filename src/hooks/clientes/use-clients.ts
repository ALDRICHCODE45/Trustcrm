import { getClients } from "@/actions/clientes/actions";
import { Client } from "@prisma/client";
import { useCallback, useState } from "react";

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchAllClients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getClients();
      if (!response.ok) {
        setError(response.message);
        return;
      }
      setClients(response.clients);
    } catch (e) {
      setError("Error al obtener los clientes");
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    //variables
    clients,
    isLoading,
    error,
    //metodos
    fetchAllClients,
  };
};
