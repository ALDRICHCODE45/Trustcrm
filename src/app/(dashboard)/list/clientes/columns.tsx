"use client";
import { ColumnDef } from "@tanstack/react-table";
import { RazonSocialPopOver } from "./components/RazonSocialPopOver";
import { ContactosSheet } from "./components/ContactosSheet";
import { HandCoins, Link as LinkIcon, ThumbsUp } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ComentariosSheet } from "../../cliente/[id]/components/ComentariosSheet";
import { FacturacionSheet } from "./components/Facturacion_instrucciones";
import { ClientesActions } from "./components/ClientesActions";
import { UserClientDropDown } from "./components/UserClientDropDown";
import { ClienteModalidad, Prisma, VacancyEstado } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { GetCounStatusByClient } from "./columnComponents/GetCounStatusByClient";

export type ClientWithRelations = Prisma.ClientGetPayload<{
  include: {
    lead: {
      include: {
        origen: true;
      };
    };
    contactos: true;
    usuario: true;
    comentarios: true;
    origen: true;
  };
}>;

export const clientesColumns: ColumnDef<ClientWithRelations>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select All"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "origen",
    header: "Origen",
    cell: ({ row }) => {
      const origenCompleto = row.original.origen?.nombre ?? "N/A";
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">
              <p className="text-foreground">{origenCompleto}</p>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Origen del cliente</p>
          </TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    accessorKey: "usuario",
    header: "Usuario",
    cell: ({ row }) => {
      return <UserClientDropDown row={row} />;
    },
  },
  {
    accessorKey: "etiqueta",
    header: "Etiqueta",
    cell: ({ row }) => {
      const etiqueta = row.original.etiqueta;
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">
              <p className="text-foreground">{etiqueta}</p>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Etiqueta del cliente</p>
          </TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    accessorKey: "cuenta",
    header: "Cuenta",
    cell: ({ row }) => {
      const cuenta = row.original.cuenta;
      return (
        <Button variant="outline">
          <p className="text-foreground">{cuenta}</p>
        </Button>
      );
    },
  },
  {
    accessorKey: "asignadas",
    header: "Asignadas",
    cell: ({ row }) => {
      return <GetCounStatusByClient clientId={row.original.id} />;
    },
  },
  {
    accessorKey: "perdidas",
    header: "Perdidas",
    cell: ({ row }) => {
      return (
        <>
          <GetCounStatusByClient
            clientId={row.original.id}
            status={VacancyEstado.Perdida}
          />
        </>
      );
    },
  },
  {
    accessorKey: "canceladas",
    header: "Canceladas",
    cell: ({ row }) => {
      return (
        <>
          <GetCounStatusByClient
            clientId={row.original.id}
            status={VacancyEstado.Cancelada}
          />
        </>
      );
    },
  },
  {
    accessorKey: "placements",
    header: "Placements",
    cell: ({ row }) => {
      return (
        <>
          <GetCounStatusByClient
            clientId={row.original.id}
            status={VacancyEstado.Placement}
          />
        </>
      );
    },
  },
  {
    accessorKey: "tp_placement",
    header: "T.P",
    cell: ({ row }) => {
      const tp = row.original.tp_placement ?? 0;
      return (
        <div className="flex gap-1 items-center">
          $<span>{tp}</span>
        </div>
      );
    },
  },
  {
    id: "contactos",
    header: "Contactos",
    cell: ({ row }) => <ContactosSheet contactos={row.original.contactos} />,
  },
  {
    accessorKey: "modalidad",
    header: "Modalidad",
    cell: ({ row }) => {
      const modalidad = row.original.modalidad as ClienteModalidad;
      const modalidadIcon = {
        Exito: <ThumbsUp size={15} className="text-gray-500" />,
        Anticipo: <HandCoins size={15} className="text-gray-500" />,
      };

      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">
              <div className="flex gap-2 items-center">
                {modalidadIcon[modalidad]}
                <span>{modalidad ?? "N/A"}</span>
              </div>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Modalidad de pago</p>
          </TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    accessorKey: "fee",
    header: "Fee",
    cell: ({ row }) => {
      const fee = row.original.fee;
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">
              <p className="">
                <span>{fee}%</span>
              </p>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Fee del cliente</p>
          </TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    accessorKey: "dias_credito",
    header: "Dias credito",
    cell: ({ row }) => {
      const credito = row.original.dias_credito;
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">
              <p className="">
                <span>{credito}</span>
                dias
              </p>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Dias de credito para el cliente</p>
          </TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    accessorKey: "tipo_factura", //PDDD O PUE,etc...
    header: "Tipo factura",
    cell: ({ row }) => {
      const tipo_factura =
        !row.original.tipo_factura || row.original.tipo_factura.trim() === ""
          ? "N/A"
          : row.original.tipo_factura;

      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" className="w-full">
              <p className="">
                <span>{tipo_factura}</span>
              </p>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Tipo de factura del cliente</p>
          </TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    accessorKey: "razon_social",
    header: "RS",
    cell: ({ row }) => {
      const razon_social =
        !row.original.razon_social || row.original.razon_social.trim() === ""
          ? "N/A"
          : row.original.razon_social;
      const firstWord = razon_social?.split(" ").at(0);

      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">
              <p className="">
                <span>{firstWord}</span>
              </p>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Razón social del cliente</p>
          </TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    accessorKey: "regimen",
    header: "Regimen",
    cell: ({ row }) => {
      const regimen = row.original?.regimen ?? "N/A";
      return <RazonSocialPopOver razon_social={regimen} />;
    },
  },
  {
    accessorKey: "tipo", //Persona moral o fisica
    header: "Tipo",
    cell: ({ row }) => {
      const tipo = row.original?.tipo ?? "N/A";
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">
              <p className="text-foreground flex gap-1 items-center">
                <span>{tipo}</span>
              </p>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Tipo de cliente</p>
          </TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    accessorKey: "rfc",
    header: "RFC",
    cell: ({ row }) => {
      const rfc =
        !row.original.rfc || row.original.rfc.trim() === ""
          ? "N/A"
          : row.original.rfc;
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">
              <p className="text-foreground flex gap-1 items-center">
                <span>{rfc}</span>
              </p>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>RFC del cliente</p>
          </TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    accessorKey: "cp",
    header: "CP",
    cell: ({ row }) => {
      const cp =
        !row.original.codigo_postal || row.original.codigo_postal.trim() === ""
          ? "N/A"
          : row.original.codigo_postal;
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">
              <p className="text-foreground flex gap-1 items-center">
                <span>{cp}</span>
              </p>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Codigo postal del cliente</p>
          </TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    accessorKey: "como_factura",
    header: "CF",
    cell: () => {
      return <FacturacionSheet />;
    },
  },
  {
    id: "comentarios",
    header: "Comentarios",
    //TODO: Agregar comentarios
    cell: ({ row }) => <ComentariosSheet comments={[]} />,
  },
  {
    accessorKey: "portal_site",
    header: "Portal",
    //TODO: Agregar comentarios
    cell: ({ row }) => {
      const portal_site = row.original.portal_site;

      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">
              <p className="text-foreground flex gap-1 items-center">
                {portal_site ? (
                  <Link href={portal_site} target="_blank">
                    <LinkIcon size={15} className="text-gray-500" />
                    <span className="text-foreground">{portal_site}</span>
                  </Link>
                ) : (
                  <span className="text-red-500">N/A</span>
                )}
              </p>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Portal del cliente</p>
          </TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      return <ClientesActions row={row} />;
    },
  },
];
