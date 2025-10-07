import { redirect } from "next/navigation";
import { auth } from "@/core/lib/auth";
import { Role } from "@prisma/client";
import { unstable_noStore } from "next/cache";

const Homepage = async () => {
  unstable_noStore();

  const session = await auth();

  if (!session) {
    redirect("/sign-in");
  }

  const user = session.user;

  const roleRoutes: Record<Role, string> = {
    [Role.reclutador]: "/reclutador",
    [Role.GL]: "/leads",
    [Role.MK]: "/leads",
    [Role.Admin]: "/admin",
  };

  const route = roleRoutes[user.role as Role] || "/sign-in";
  redirect(route);
};

export default Homepage;
