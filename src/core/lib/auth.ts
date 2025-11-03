import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "./db";
import { LogAction, Role, User, UserState } from "@prisma/client";

class InvalidLoginError extends CredentialsSignin {
  code = "Invalid identifier or password";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        let user: User | null = null;

        // logic to verify if the user exists
        user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (
          !user ||
          !bcrypt.compareSync(credentials.password as string, user.password) ||
          user.State === UserState.INACTIVO
        ) {
          // No user found, so this is their first attempt to login
          throw new InvalidLoginError();
        }

        //creare el log de inicio de sesion
        await prisma.log.create({
          data: {
            action: LogAction.Ingresar,
            autorId: user.id,
          },
        });
        // return user object with their profile data
        return user;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 horas (1 día)
    updateAge: 60 * 60, // Actualizar cada hora
  },
  callbacks: {
    async jwt({ token, user, session, trigger }) {
      // Durante el login inicial, 'user' contiene los datos del usuario retornado por authorize()
      if (user) {
        token.role = user.role as string;
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      // Durante las actualizaciones del token (trigger: "update")
      if (trigger === "update" && session?.user) {
        token.role = session.user.role as string;
        token.id = session.user.id;
        token.name = session.user.name;
        token.email = session.user.email;
      }
      return token;
    },
    async session({ session, token, trigger }) {
      if (token && session.user) {
        session.user.role = token.role as Role;
        session.user.id = token.id as string;
      }

      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
});
