
export interface DailyMetric {
  id: string;
  date: string;
  leads: number;
  qualifications: number;
  meetings: number;
  sales: number;
  value: number;
  adsInvestment: number;
  observations: string;
}

export interface ClientAttachment {
  id: string;
  name: string;
  data: string;
  mimeType: string;
  date: string;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  contractDate: string;
  contractValue: number;
  qualificationNotes: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  files?: ClientAttachment[];
}

export interface GoldenMoment {
  id: string;
  closerName: string;
  category: 'Fechamento' | 'Objeção' | 'Diagnóstico' | 'Rapport';
  description: string;
  date: string;
  meetingId: string;
}

export interface MeetingRecording {
  id: string;
  date: string;
  closerName: string;
  clientName: string;
  audioBase64?: string;
  analysis?: CloserPerformance;
  status: 'pending' | 'analyzing' | 'completed' | 'error';
}

export interface CloserPerformance {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  improvementPoints: string[];
  summary: string;
  techniquesObserved: string[];
}

export interface CommercialInsight {
  analysis: string;
  suggestions: string[];
  status: 'positive' | 'neutral' | 'negative';
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: 'admin' | 'employee';
}

export interface PlaybookEntry {
  id: string;
  title: string;
  content: string;
  type: 'Closer' | 'SDR';
  lastUpdated: string;
  attachment?: {
    name: string;
    data: string;
    mimeType: string;
  };
}

export interface Suggestion {
  id: string;
  userName: string;
  userAvatar?: string;
  message: string;
  timestamp: string;
  category: 'Marketing' | 'Processo' | 'IA' | 'Outros';
  status: 'Analise' | 'Implementado' | 'Recusado';
}

export interface NortePlan {
  id: string;
  name: string;
  description: string;
  price?: string;
  attachment?: {
    name: string;
    data: string;
    mimeType: string;
  };
}
