import { getLoggedUser, getReclutadores } from "@/actions/users/actions";
import { Role, User } from "@prisma/client";
import { useCallback, useState } from "react";

export const useUsers = () => {
  //usuario logeado
  const [loggedUser, setLoggedUser] = useState<User | null>(null);
  //reclutadores
  const [users, setUsers] = useState<User[]>([]);
  //estados
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLoggedUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getLoggedUser();
      if (!response.ok) {
        setError(response.message);
        return;
      }
      setLoggedUser(response.user);
    } catch (e) {
      setError("Error al obtener el usuario logeado");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchReclutadores = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getReclutadores();
      if (!response.ok) {
        setError(response.message);
        return;
      }
      setUsers(response.users);
    } catch (e) {
      setError("Error al obtener los reclutadores");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    //variables
    users,
    isLoading,
    error,
    loggedUser,
    //metodos
    fetchReclutadores,
    fetchLoggedUser,
  };
};
