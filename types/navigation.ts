export interface Location {
  id: string;
  city: string;
  state: string;
  country: string;
}

export interface Favorite {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
}

export type ReportReason =
  | 'spam'
  | 'fraud'
  | 'prohibited-item'
  | 'misleading'
  | 'harassment'
  | 'other';

export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

export interface Report {
  id: string;
  reporterId: string;
  productId?: string;
  sellerId?: string;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  createdAt: string;
}

export interface CreateReportInput {
  productId?: string;
  sellerId?: string;
  reason: ReportReason;
  description: string;
}
