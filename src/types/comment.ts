import { Prisma } from "@prisma/client";

export type CommentWithRelations = Prisma.CommentGetPayload<{
  include: {
    author: true;
    task: {
      include: {
        assignedTo: true;
        notificationRecipients: true;
      };
    };
    vacancy: true;
  };
}>;

export interface EditCommentData {
  content: string;
}

export interface CreateCommentData {
  content: string;
  authorId: string;
  vacancyId?: string;
  isTask?: boolean;
  title?: string;
  description?: string;
  assignedToId?: string;
  dueDate?: Date;
  notifyOnComplete?: boolean;
  notificationRecipients?: string[];
}

export interface CreateTaskData {
  title: string;
  description: string;
  dueDate: Date;
  assignedToId: string;
  notifyOnComplete?: boolean;
  notificationRecipients?: string[];
}
