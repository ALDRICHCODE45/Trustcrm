"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userLoginSchema, type UserLoginInput } from "@features/Auth/schemas/userLogin.schema";

export function useSignInForm(onSubmit: (values: UserLoginInput) => Promise<void> | void) {
  const form = useForm<UserLoginInput>({
    resolver: zodResolver(userLoginSchema),
    defaultValues: { email: "", password: "" }
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return { form, handleSubmit };
}


