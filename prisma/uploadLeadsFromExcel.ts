//Archivo para subir leads desde archivo excel con un script
//ejecutar con: bunx tsx prisma/uploadLeadsFromExcel.ts
import { PrismaClient } from "@prisma/client";
import { addDays, format } from "date-fns";
import { es } from "date-fns/locale";
import * as fs from "fs";
import path from "path";
import * as XLSX from "xlsx";

const prisma = new PrismaClient();

//funcion helper para convertir fecha de excel a fecha de js
function convertAndFormatExcelDate(
  excelSerialDate: number,
  formatString = "yyyy-MM-dd HH:mm:ss"
) {
  const excelEpoch = new Date(1899, 11, 30);
  const convertedDate = addDays(excelEpoch, excelSerialDate);

  return format(convertedDate, formatString, { locale: es });
}

// Tipo para definir la estructura de tus datos Excel
interface ExcelRow {
  empresa: string;
  sector: string;
  origen: string;
  web: string;
  creation: number;
}

const uploadFileFromExcel = async (filePath: string) => {
  try {
    const absolutePath = path.resolve(filePath);
    const generador = await prisma.user.findFirst({
      where: {
        email: "comercial@trustpeople.company",
      },
      select: {
        id: true,
      },
    });
    if (!generador) {
      throw new Error("Generador no encontrado");
    }

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Archivo no encontrado: ${absolutePath}`);
    }
    //leer el archivo excel
    const workbook = XLSX.readFile(filePath);
    // Obtener la primera hoja
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    // Convertir a JSON
    const data: any[] = XLSX.utils.sheet_to_json(worksheet, {
      dateNF: "dd/mm/yyyy",
    });

    //recorrer el array de datos y crear los leads
    for (const row of data as ExcelRow[]) {
      const { empresa, sector, creation, origen, web } = row;

      const sectorExists = await prisma.sector.findFirst({
        where: {
          nombre: {
            equals: sector,
            mode: "insensitive",
          },
        },
      });

      const origenExists = await prisma.leadOrigen.findFirst({
        where: {
          nombre: {
            equals: origen,
            mode: "insensitive",
          },
        },
      });

      let sectorId: string;
      let origenId: string;

      if (sectorExists) {
        sectorId = sectorExists.id;
      } else {
        const newSector = await prisma.sector.create({
          data: {
            nombre: sector,
          },
          select: {
            id: true,
          },
        });
        sectorId = newSector.id;
      }

      if (origenExists) {
        origenId = origenExists.id;
      } else {
        const newOrigen = await prisma.leadOrigen.create({
          data: {
            nombre: origen,
          },
          select: {
            id: true,
          },
        });
        origenId = newOrigen.id;
      }

      await prisma.lead.create({
        data: {
          generadorId: generador.id,
          empresa: empresa,
          sectorId: sectorId,
          origenId: origenId,
          link: web,
          createdAt: convertAndFormatExcelDate(creation),
        },
      });
    }
  } catch (e) {
    throw new Error("Error el subir los leads");
  }
};

uploadFileFromExcel("./prisma/gl_iran.xlsx");
