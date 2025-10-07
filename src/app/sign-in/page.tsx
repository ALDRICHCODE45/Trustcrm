import { auth } from "@/core/lib/auth";
import { LoginForm } from "../../components/login/login-form";
import { redirect } from "next/navigation";
import Image from "next/image";
import logoTrust from "../../../public/logotrust.png";

export const metadata = {
  title: "Trust | Login",
  description: "Login to your account",
};

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/admin");
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      {/* Panel izquierdo con imagen */}
      <div className="relative hidden h-full flex-col bg-white border-r lg:flex">
        <div className="flex-1 flex items-center justify-center">
          <Image
            src={logoTrust}
            alt="Imagen de login"
            width={300}
            height={300}
            className="object-contain"
          />
        </div>
      </div>
      {/* Panel derecho con formulario */}
      <div className="lg:p-8">
        <LoginForm />
      </div>
    </div>
  );
}
