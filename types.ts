export type ActivityType = 
  | 'lead_created' // New type for initial registration
  | 'call' 
  | 'meeting_booked' 
  | 'meeting_held' 
  | 'proposal' 
  | 'sale';

export type Outcome = 
  | 'new' // Status for new leads
  | 'working'
  | 'qualified'
  | 'unqualified'
  | 'no_answer' 
  | 'connected' 
  | 'gatekeeper' 
  | 'scheduled' 
  | 'rescheduled' 
  | 'show' 
  | 'no_show' 
  | 'sent' 
  | 'accepted' 
  | 'rejected' 
  | 'closed_won' 
  | 'closed_lost';

export type ProductType = 
  | 'Consultoria' 
  | 'SaaS Enterprise' 
  | 'SaaS Basic' 
  | 'Implementação' 
  | 'Outros';

export type LeadSource = 
  | 'Inbound'
  | 'Outbound' 
  | 'Linkedin' 
  | 'Google Ads' 
  | 'Indicação' 
  | 'Eventos';

export interface SalesData {
  id: string;
  date: string; // ISO String YYYY-MM-DD
  leadName: string; // Empresa
  contactName?: string; // Contato (Pessoa)
  email?: string;
  phone?: string;
  leadStatus?: string; // Visual status from the dropdown
  type: ActivityType;
  outcome: Outcome;
  duration?: number; // Duration in minutes
  sdrName: string;
  closerName?: string;
  value?: number; // Only for proposals/sales/estimated
  product?: ProductType;
  leadSource?: LeadSource;
  notes?: string;
}

export interface KPIMetrics {
  totalCalls: number;
  connectedCalls: number;
  meetingsBooked: number;
  meetingsHeld: number;
  proposalsSent: number;
  salesClosed: number;
  totalRevenue: number;
  avgTicket: number;
  avgSalesCycle: number;
  
  // Rates
  connectionRate: number;
  callToMeetingRate: number;
  showRate: number;
  meetingToProposalRate: number;
  proposalToSaleRate: number;
  overallConversion: number;

  // Breakdowns
  salesByProduct: Record<string, number>;
  salesBySource: Record<string, number>;
}

export interface TeamState {
  sdrs: string[];
  closers: string[];
  admins: string[];
}