import NextAuth, { DefaultSession } from "next-auth";
import { User as PrismaUser } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: PrismaUser;
  }

  interface User extends PrismaUser {}
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    name?: string | null;
    email?: string | null;
  }
}
