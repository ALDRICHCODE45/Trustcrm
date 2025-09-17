"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 p-6">
      {/* Filtros */}
      <div className="flex gap-4 items-center mt-10">
        <Skeleton className="h-10 w-[200px] animate-pulse rounded-full  " />
        <Skeleton className="h-10 w-[150px] animate-pulse rounded-full" />
        <Skeleton className="h-10 w-[120px] animate-pulse rounded-full" />
      </div>

      {/* Tabla */}
      <div className="mt-14">
        <Skeleton className=" mt-14 h-[500px] w-full rounded-xl animate-pulse" />
      </div>
    </div>
  );
}
