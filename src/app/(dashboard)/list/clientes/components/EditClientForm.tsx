"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Building2, FileText, Settings } from "lucide-react";
import { ClientWithRelations } from "../columns";
import { EditClientFormData, editClientSchema } from "@/zod/editClientSchema";
import { updateClientById } from "@/actions/clientes/actions";
import { getLeadsUsers } from "@/actions/users/create-user";
import { getAllOrigenes } from "@/actions/sectores/actions";
import { toast } from "sonner";
import { ClienteEtiqueta } from "@prisma/client";
import { ToastCustomMessage } from "@/components/ToastCustomMessage";

interface EditClientFormProps {
  clientData: ClientWithRelations;
  isOpen: boolean;
  onClose: () => void;
}

export const EditClientForm = ({
  clientData,
  isOpen,
  onClose,
}: EditClientFormProps) => {
  const [activeTab, setActiveTab] = useState<string>("general");
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [origenes, setOrigenes] = useState<any[]>([]);

  // Configurar react-hook-form con zodResolver
  const form = useForm<EditClientFormData>({
    resolver: zodResolver(editClientSchema),
    defaultValues: {
      id: clientData.id,
      usuarioId: clientData.usuarioId,
      etiqueta: clientData.etiqueta || ClienteEtiqueta.PreCliente,
      cuenta: clientData.cuenta || "",
      asignadas: clientData.asignadas || 0,
      perdidas: clientData.perdidas || 0,
      canceladas: clientData.canceladas || 0,
      placements: clientData.placements || 0,
      tp_placement: clientData.tp_placement || 0,
      modalidad: clientData.modalidad as "Exito" | "Anticipo" | undefined,
      fee: clientData.fee || 0,
      dias_credito: clientData.dias_credito || 0,
      tipo_factura: clientData.tipo_factura || "",
      razon_social: clientData.razon_social || "",
      regimen: clientData.regimen || "",
      rfc: clientData.rfc || "",
      codigo_postal: clientData.codigo_postal || "",
      como_factura: clientData.como_factura || "",
      portal_site: clientData.portal_site || "",
      origenId: clientData.origenId || "",
    },
    mode: "onChange",
  });

  // Cargar usuarios y orígenes al abrir el modal
  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, origenesData] = await Promise.all([
          getLeadsUsers(),
          getAllOrigenes(),
        ]);
        setUsers(usersData);
        setOrigenes(origenesData);
      } catch (error) {
        console.error("Error cargando datos:", error);
        toast.custom((t) => (
          <ToastCustomMessage
            message="Error al cargar los datos del formulario"
            title="Error"
            type="error"
            onClick={() => toast.dismiss(t)}
          />
        ));
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Función para manejar el envío del formulario
  const onSubmit = async (data: EditClientFormData) => {
    setIsLoading(true);
    try {
      await updateClientById(data);
      toast.custom((t) => (
        <ToastCustomMessage
          message="Cliente actualizado exitosamente"
          title="Success"
          type="success"
          onClick={() => toast.dismiss(t)}
        />
      ));
      onClose();
    } catch (error) {
      console.error("Error actualizando cliente:", error);
      toast.custom((t) => (
        <ToastCustomMessage
          message="Error al actualizar el cliente"
          title="Error"
          type="error"
          onClick={() => toast.dismiss(t)}
        />
      ));
    } finally {
      setIsLoading(false);
    }
  };

  // Función para manejar el cierre del modal
  const handleClose = (): void => {
    // Resetear el formulario con los datos originales
    form.reset({
      id: clientData.id,
      usuarioId: clientData.usuarioId,
      etiqueta: clientData.etiqueta || ClienteEtiqueta.PreCliente,
      cuenta: clientData.cuenta || "",
      asignadas: clientData.asignadas || 0,
      perdidas: clientData.perdidas || 0,
      canceladas: clientData.canceladas || 0,
      placements: clientData.placements || 0,
      tp_placement: clientData.tp_placement || 0,
      modalidad: clientData.modalidad as "Exito" | "Anticipo" | undefined,
      fee: clientData.fee || 0,
      dias_credito: clientData.dias_credito || 0,
      tipo_factura: clientData.tipo_factura || "",
      razon_social: clientData.razon_social || "",
      regimen: clientData.regimen || "",
      rfc: clientData.rfc || "",
      codigo_postal: clientData.codigo_postal || "",
      como_factura: clientData.como_factura || "",
      portal_site: clientData.portal_site || "",
      origenId: clientData.origenId || "",
    });
    setActiveTab("general");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="overflow-y-auto sm:max-w-4xl [&>button:last-child]:top-3.5 max-h-[min(700px,85vh)]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Editar Cliente: {clientData.cuenta || "Sin nombre"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger
                  value="general"
                  className="flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  General
                </TabsTrigger>
                <TabsTrigger
                  value="estadisticas"
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Estadísticas
                </TabsTrigger>
                <TabsTrigger
                  value="facturacion"
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Facturación
                </TabsTrigger>
                <TabsTrigger
                  value="configuracion"
                  className="flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  Configuración
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Información General
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="usuarioId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Usuario Asignado{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar usuario" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="z-[9999]">
                              {users.map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="etiqueta"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Etiqueta</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="z-[9999]">
                              <SelectItem value={ClienteEtiqueta.PreCliente}>
                                Pre-Cliente
                              </SelectItem>
                              <SelectItem value={ClienteEtiqueta.Cliente}>
                                Cliente
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cuenta"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cuenta</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nombre de la cuenta"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="origenId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Origen</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar origen" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="z-[9999]">
                              {origenes.map((origen) => (
                                <SelectItem key={origen.id} value={origen.id}>
                                  {origen.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="estadisticas" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Estadísticas del Cliente
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="asignadas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Asignadas</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="perdidas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Perdidas</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="canceladas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Canceladas</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="placements"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Placements</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tp_placement"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>TP Placement</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="facturacion" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Información de Facturación
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="razon_social"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Razón Social</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Razón social de la empresa"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rfc"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>RFC</FormLabel>
                          <FormControl>
                            <Input placeholder="RFC de la empresa" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="regimen"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Régimen Fiscal</FormLabel>
                          <FormControl>
                            <Input placeholder="Régimen fiscal" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="codigo_postal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código Postal</FormLabel>
                          <FormControl>
                            <Input placeholder="Código postal" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tipo_factura"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Factura</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="z-[9999]">
                              <SelectItem value="factura">Factura</SelectItem>
                              <SelectItem value="recibo">Recibo</SelectItem>
                              <SelectItem value="nota">Nota</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="como_factura"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cómo Factura</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Método de facturación"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="configuracion" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Configuración Comercial
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="modalidad"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Modalidad</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar modalidad" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="z-[9999]">
                              <SelectItem value="Exito">Éxito</SelectItem>
                              <SelectItem value="Anticipo">Anticipo</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fee (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="Porcentaje de comisión"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dias_credito"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Días de Crédito</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder="Días de crédito"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="portal_site"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Portal/Sitio Web</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="URL del portal o sitio web"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                type="button"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? "Actualizando..." : "Actualizar Cliente"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
