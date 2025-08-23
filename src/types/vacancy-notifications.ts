export enum NotificationVacancyType {
  Checklist = "checklist",
  JobDescription = "job_description",
  PerfilMuestra = "perfil_muestra",
}

export interface createVacancyNotificationProps {
  vacancyId: string;
  type: NotificationVacancyType;
}
