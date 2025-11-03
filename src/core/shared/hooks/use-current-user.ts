"use client";

import { useSession } from "next-auth/react";

export function useCurrentUser() {
  const { data, status } = useSession();
  const user = data?.user ?? null;
  const isAuthenticated = !!user;
  return { user, status, isAuthenticated, session: data };
}

export default useCurrentUser;
