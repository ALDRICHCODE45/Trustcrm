"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";

type FormState =
  | {
      error?: string;
      success?: boolean;
    }
  | undefined;

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const credentialsAction = async (
    prevState: FormState,
    formData: FormData
  ) => {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!validateEmail(email)) {
      return { error: "Por favor ingresa un email válido" };
    }

    if (password.length < 6) {
      return { error: "La contraseña debe tener al menos 6 caracteres" };
    }

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        return {
          error: "Credenciales inválidas. Por favor intenta nuevamente",
        };
      } else if (result?.ok) {
        router.push("/");
        router.refresh();
        return { success: true };
      }
    } catch (err) {
      return { error: "Error al iniciar sesión. Por favor intenta más tarde" };
    }
  };

  const [state, formAction, isPending] = useActionState(
    credentialsAction,
    undefined
  );

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Bienvenido de vuelta
        </h1>
        <p className="text-sm text-muted-foreground">
          Ingresa tu email para acceder a tu cuenta
        </p>
      </div>

      <div className="grid gap-6">
        {state?.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm text-center">{state.error}</p>
          </div>
        )}

        <form className="space-y-4" action={formAction}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Dirección de email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="usuario@ejemplo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={
                  !validateEmail(email) && email ? "border-red-500" : ""
                }
              />
              {!validateEmail(email) && email && (
                <p className="text-red-500 text-xs">Email inválido</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
              />
            </div>

            <Button
              className="w-full"
              disabled={
                isPending || !validateEmail(email) || password.length < 6
              }
              type="submit"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </Button>
          </div>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              By Trust
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
