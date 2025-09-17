"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error); // Loguea el error en consola
  }, [error]);

  return (
    <div className="flex h-[70vh] w-full items-center justify-center">
      <Card className="w-full max-w-md p-6 text-center">
        <CardTitle className="mb-2">Algo salió mal</CardTitle>
        <CardDescription>
          Ocurrió un error al cargar los datos del reportes.
        </CardDescription>
        <CardFooter className="justify-center mt-6">
          <Button onClick={() => reset()}>Intentar de nuevo</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
