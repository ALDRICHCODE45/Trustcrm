"use client";
import SignInForm from "@features/Auth/components/forms/SignInForm";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function SignInPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function onSubmit(values: { email: string; password: string }) {
    setErrorMessage(null);
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false
    });
    if (result?.error) {
      setErrorMessage("Usuario o contraseña incorrectos.");
      return;
    }
    if (result?.url) {
      startTransition(() => router.push("/admin"));
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm py-8">
      <h1 className="mb-6 text-center text-2xl font-semibold">Iniciar sesión</h1>
      {errorMessage && (
        <p className="mb-4 text-sm text-red-600">{errorMessage}</p>
      )}
      <SignInForm onSubmit={onSubmit} />
    </div>
  );
}


