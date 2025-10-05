import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

export function checkRoleRedirect(
  userRole: Role | undefined,
  allowedRoles: Role[]
) {
  if (!userRole) redirect("/sign-in?error=unauthorized");

  if (!allowedRoles.includes(userRole)) {
    const fallbackRoutes: Record<Role, string> = {
      [Role.reclutador]: "/reclutador",
      [Role.GL]: "/leads",
      [Role.MK]: "/leads",
      [Role.Admin]: "/admin",
    };

    const fallback = fallbackRoutes[userRole] || "/";
    redirect(`${fallback}?error=unauthorized`);
  }
}
