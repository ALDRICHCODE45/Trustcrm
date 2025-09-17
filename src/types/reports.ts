export interface LeadReportData {
  generadorId: string;
  generadorName: string;
  periodo: string;
  contactos: number;
  socialSelling: number;
  contactoCalido: number;
  citaAgendada: number;
  citaAtendida: number;
  citaValidada: number;
  asignadas: number;
  total: number;
}

export interface LeadReportFilters {
  generadorId?: string;
  fechaInicio: Date;
  fechaFin: Date;
}

export interface LeadReportSummary {
  totalGeneradores: number;
  totalContactos: number;
  totalSocialSelling: number;
  totalContactoCalido: number;
  totalCitaAgendada: number;
  totalCitaAtendida: number;
  totalCitaValidada: number;
  totalAsignadas: number;
  totalGeneral: number;
}

export interface LeadGenerator {
  id: string;
  name: string;
  email: string;
}
