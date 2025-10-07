import { auth } from "@/core/lib/auth";
import { redirect } from "next/navigation";

export const checkSession = async (path: string = "/sign-in") => {
  const session = await auth();

  if (!session) {
    redirect(path);
  }
  return session;
};
