export type TicketStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';

export interface Ticket {
  ticketId: string;
  title: string;
  description: string;
  status: TicketStatus;
  type?: string;
  creatorId: string;
  creatorName?: string;
  creatorAvatar?: string;
  assigneeId?: string | null;
  assigneeName?: string | null;
  assigneeAvatar?: string | null;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}
