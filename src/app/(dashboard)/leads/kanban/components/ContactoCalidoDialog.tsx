"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeadWithRelations } from "../page";
import { SubSector } from "@prisma/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ToastCustomMessage } from "@/components/ToastCustomMessage";

interface ContactoCalidoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: LeadWithRelations | null;
  onConfirm: (data: ContactoCalidoFormData) => void;
  subSectores: SubSector[];
  onCancel: () => void;
}

export interface ContactoCalidoFormData {
  numeroEmpleados: string;
  ubicacion: string;
  subsector: string;
  subOrigen: string;
}

export function ContactoCalidoDialog({
  open,
  onOpenChange,
  lead,
  onConfirm,
  onCancel,
  subSectores,
}: ContactoCalidoDialogProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<ContactoCalidoFormData>({
    numeroEmpleados: "",
    ubicacion: "",
    subsector: "",
    subOrigen: "",
  });

  const [errors, setErrors] = useState<Partial<ContactoCalidoFormData>>({});

  const handleInputChange = (
    field: keyof ContactoCalidoFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactoCalidoFormData> = {};

    if (!formData.numeroEmpleados.trim()) {
      newErrors.numeroEmpleados = "Este campo es obligatorio";
    }
    if (!formData.ubicacion.trim()) {
      newErrors.ubicacion = "Este campo es obligatorio";
    }
    if (!formData.subsector.trim()) {
      newErrors.subsector = "Este campo es obligatorio";
    }

    if (!formData.subOrigen.trim()) {
      newErrors.subOrigen = "Este campo es obligatorio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onConfirm(formData);
      // Reset form
      setFormData({
        numeroEmpleados: "",
        ubicacion: "",
        subsector: "",
        subOrigen: "",
      });
      setErrors({});
    }

    toast.custom((t) => (
      <ToastCustomMessage
        message="Por favor refresca la pagina para visualizar los ultimos cambios"
        onClick={() => toast.dismiss(t)}
        title="Lead actualizado"
        type="info"
      />
    ));
    router.refresh();
  };

  const handleCancel = () => {
    onCancel();
    // Reset form
    setFormData({
      numeroEmpleados: "",
      ubicacion: "",
      subsector: "",
      subOrigen: "",
    });
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-0 overflow-y-scroll p-0 sm:max-w-4xl [&>button:last-child]:top-3.5 max-h-[min(700px,85vh)]">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b border-border px-6 py-4 text-base">
            Información adicional - Contacto Cálido
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">
          Para mover {lead?.empresa} a Contacto Cálido, necesitamos información
          adicional sobre la empresa.
        </DialogDescription>

        {/* Mostrar sector actual */}
        <Card className="mx-6 mt-6 mb-2 border rounded-lg shadow-sm bg-background">
          <CardHeader className="pb-2">
            <h3 className="text-lg font-semibold text-primary">
              Resumen de la Empresa
            </h3>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-muted-foreground">
                Empresa:
              </span>
              <span className="text-base text-foreground">{lead?.empresa}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-muted-foreground">
                Sector actual:
              </span>
              <span className="text-base text-foreground">
                {lead?.sector?.nombre || "No especificado"}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="overflow-y-auto">
          <div className="px-6 pt-6 pb-6">
            <form
              id="contacto-calido-form"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="numeroEmpleados">Número de empleados *</Label>
                  <Select
                    value={formData.numeroEmpleados}
                    onValueChange={(value) =>
                      handleInputChange("numeroEmpleados", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tamaño" />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      <SelectItem value="1-10">1-10 empleados</SelectItem>
                      <SelectItem value="11-50">11-50 empleados</SelectItem>
                      <SelectItem value="51-100">51-100 empleados</SelectItem>
                      <SelectItem value="101-500">101-500 empleados</SelectItem>
                      <SelectItem value="500+">Más de 500 empleados</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.numeroEmpleados && (
                    <p className="text-sm text-red-500">
                      {errors.numeroEmpleados}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ubicacion">Ubicación *</Label>
                  <Input
                    id="ubicacion"
                    placeholder="Ciudad, Estado, País"
                    value={formData.ubicacion}
                    onChange={(e) =>
                      handleInputChange("ubicacion", e.target.value)
                    }
                  />
                  {errors.ubicacion && (
                    <p className="text-sm text-red-500">{errors.ubicacion}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="subsector">Subsector *</Label>
                    <Select
                      value={formData.subsector}
                      onValueChange={(value) =>
                        handleInputChange("subsector", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el subsector específico" />
                      </SelectTrigger>
                      <SelectContent className="z-[9999]">
                        {subSectores.map((subSector) => (
                          <SelectItem key={subSector.id} value={subSector.id}>
                            {subSector.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.subsector && (
                      <p className="text-sm text-red-500">{errors.subsector}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="subOrigen">Sub origen*</Label>
                    <Input
                      id="subOrigen"
                      placeholder="https://linkedin..."
                      value={formData.subOrigen}
                      onChange={(e) =>
                        handleInputChange("subOrigen", e.target.value)
                      }
                    />
                    {errors.subOrigen && (
                      <p className="text-sm text-red-500">{errors.subOrigen}</p>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        <DialogFooter className="border-t px-6 py-4 gap-2">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button type="submit" form="contacto-calido-form">
            Confirmar y mover a Contacto Cálido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
