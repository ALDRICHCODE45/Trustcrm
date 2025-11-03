"use client";

import { useSignInForm } from "@features/Auth/hooks/useSignInForm";
import type { UserLoginInput } from "@features/Auth/schemas/userLogin.schema";
import { Button } from "@core/shared/ui/button";
import { Input } from "@core/shared/ui/input";
import { Label } from "@core/shared/ui/label";

type Props = {
  onSubmit: (values: UserLoginInput) => Promise<void> | void;
};

export function SignInForm({ onSubmit }: Props) {
  const { form, handleSubmit } = useSignInForm(onSubmit);
  const { register, formState } = form;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
        {formState.errors.email && (
          <p className="text-sm text-red-600">{formState.errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
        {formState.errors.password && (
          <p className="text-sm text-red-600">{formState.errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full">Ingresar</Button>
    </form>
  );
}

export default SignInForm;


