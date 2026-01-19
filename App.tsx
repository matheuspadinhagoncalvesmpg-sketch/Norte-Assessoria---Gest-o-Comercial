import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  TrendingUp, 
  Users, 
  Target, 
  Briefcase, 
  DollarSign,
  BrainCircuit, 
  Trash2,
  Calendar,
  Mic,
  FileAudio,
  FileVideo,
  UserCheck,
  ChevronRight,
  Loader2,
  Trophy,
  AlertCircle,
  Upload,
  CheckCircle2,
  XCircle,
  Video,
  Play,
  FileUp,
  Search,
  UserPlus,
  Info,
  ArrowLeft,
  Key,
  Star,
  Bookmark,
  Sparkles,
  Quote,
  Zap,
  User,
  Settings,
  LogOut,
  Mail,
  Phone,
  Camera,
  X,
  BookOpen,
  FileText,
  MessageSquare,
  Paperclip,
  Download,
  Lightbulb,
  Send,
  Filter,
  CreditCard,
  Package,
  File,
  Image as ImageIcon,
  ShieldCheck,
  Lock,
  ExternalLink,
  Bot,
  MessageCircleQuestion,
  Sparkle,
  Sword,
  Wand2,
  Headset,
  Handshake,
  CalendarDays,
  CalendarRange,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  BarChart3,
  PieChart,
  Layers
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { DailyMetric, CommercialInsight, MeetingRecording, CloserPerformance, Client, GoldenMoment, UserProfile, PlaybookEntry, Suggestion, NortePlan, ClientAttachment } from './types';
import { getCommercialInsights, analyzeMeetingRecording, generateSalesFeedbackReport } from './services/geminiService';

const App: React.FC = () => {
  const [metrics, setMetrics] = useState<DailyMetric[]>([]);
  const [recordings, setRecordings] = useState<MeetingRecording[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [goldenMoments, setGoldenMoments] = useState<GoldenMoment[]>([]);
  const [playbooks, setPlaybooks] = useState<PlaybookEntry[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [nortePlans, setNortePlans] = useState<NortePlan[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'add' | 'closers' | 'clientes' | 'biblioteca' | 'playbook' | 'planos' | 'sugestoes'>('dashboard');
  const [playbookSubTab, setPlaybookSubTab] = useState<'Closer' | 'SDR'>('SDR');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // AI Chat State
  const [aiChatMessages, setAiChatMessages] = useState<{role: 'user' | 'bot', text: string}[]>([
    { role: 'bot', text: 'Olá! Sou o Norte AI. Sou seu braço direito em vendas. Precisa de palavras de poder para um fechamento ou ajuda com alguma objeção agora?' }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const aiChatEndRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sales Feedback State
  const [salesReport, setSalesReport] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportPeriod, setReportPeriod] = useState<'Diário' | 'Semanal' | 'Mensal' | null>(null);

  // Commercial Insight State
  const [commercialInsight, setCommercialInsight] = useState<CommercialInsight | null>(null);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);

  // Profile State
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Administrador Norte',
    email: 'admin@norteassessoria.com.br',
    phone: '(11) 99999-9999',
    avatar: undefined,
    role: 'admin'
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = profile.role === 'admin';

  // Client Documents State
  const clientFileInputRef = useRef<HTMLInputElement>(null);
  const newClientFilesInputRef = useRef<HTMLInputElement>(null);
  const [tempClientFiles, setTempClientFiles] = useState<ClientAttachment[]>([]);

  // Closers / IA State
  const [isAnalyzingAudio, setIsAnalyzingAudio] = useState(false);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingMedia, setPendingMedia] = useState<{ base64: string; fileName: string; mimeType: string; size: number } | null>(null);
  const [closerForm, setCloserForm] = useState({
    closerName: '',
    clientName: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const savedMetrics = localStorage.getItem('norte_metrics');
    const savedRecordings = localStorage.getItem('norte_recordings');
    const savedClients = localStorage.getItem('norte_clients');
    const savedMoments = localStorage.getItem('norte_moments');
    const savedProfile = localStorage.getItem('norte_profile');
    const savedPlaybooks = localStorage.getItem('norte_playbooks');
    const savedSuggestions = localStorage.getItem('norte_suggestions');
    const savedPlans = localStorage.getItem('norte_plans');
    
    if (savedMetrics) setMetrics(JSON.parse(savedMetrics));
    if (savedRecordings) setRecordings(JSON.parse(savedRecordings));
    if (savedClients) setClients(JSON.parse(savedClients));
    if (savedMoments) setGoldenMoments(JSON.parse(savedMoments));
    if (savedProfile) setProfile(JSON.parse(savedProfile));
    if (savedPlaybooks) setPlaybooks(JSON.parse(savedPlaybooks));
    if (savedSuggestions) setSuggestions(JSON.parse(savedSuggestions));
    if (savedPlans) setNortePlans(JSON.parse(savedPlans));
  }, []);

  useEffect(() => {
    localStorage.setItem('norte_metrics', JSON.stringify(metrics));
    localStorage.setItem('norte_recordings', JSON.stringify(recordings));
    localStorage.setItem('norte_clients', JSON.stringify(clients));
    localStorage.setItem('norte_moments', JSON.stringify(goldenMoments));
    localStorage.setItem('norte_profile', JSON.stringify(profile));
    localStorage.setItem('norte_playbooks', JSON.stringify(playbooks));
    localStorage.setItem('norte_suggestions', JSON.stringify(suggestions));
    localStorage.setItem('norte_plans', JSON.stringify(nortePlans));
  }, [metrics, recordings, clients, goldenMoments, profile, playbooks, suggestions, nortePlans]);

  useEffect(() => {
    aiChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiChatMessages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [suggestions]);

  const handleAskAi = async (userInput: string) => {
    if (!userInput.trim() || isAiThinking) return;
    setAiChatMessages(prev => [...prev, { role: 'user', text: userInput }]);
    setIsAiThinking(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userInput,
        config: {
          systemInstruction: 'Você é o Norte AI, o assistente virtual da Norte Assessoria. Sua especialidade é Vendas e Copywriting Persuasivo. Sua missão é ajudar vendedores que estão com dificuldade de fechar ou encontrar palavras-chave impactantes. Sempre forneça "Palavras de Poder", gatilhos de urgência, escassez e autoridade. Use termos como ROI, Previsibilidade, Escala e Conversão. Se o usuário pedir palavras-chave, forneça uma lista em tópicos com o motivo técnico de usar cada uma.'
        }
      });
      const botText = response.text || 'Desculpe, tive um problema ao processar sua dúvida.';
      setAiChatMessages(prev => [...prev, { role: 'bot', text: botText }]);
    } catch (err) {
      setAiChatMessages(prev => [...prev, { role: 'bot', text: 'Sistema temporariamente offline.' }]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleGenerateReport = async (period: 'Diário' | 'Semanal' | 'Mensal') => {
    setIsGeneratingReport(true);
    setReportPeriod(period);
    try {
      const report = await generateSalesFeedbackReport(recordings, period);
      setSalesReport(report);
    } catch (e) {
      setSalesReport("Falha ao gerar o relatório.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleGenerateInsight = async () => {
    if (metrics.length === 0) return;
    setIsGeneratingInsight(true);
    try {
      const recentMetrics = metrics.slice(0, 14); // Analyze last 14 entries for recent context
      const result = await getCommercialInsights(recentMetrics);
      setCommercialInsight(result);
    } catch (error) {
      console.error("Failed to generate insight", error);
    } finally {
      setIsGeneratingInsight(false);
    }
  };

  const handleAddMetric = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    const newMetric: DailyMetric = { ...formData, id: Math.random().toString(36).substr(2, 9) };
    setMetrics(prev => [...prev, newMetric].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setFormData({ date: new Date().toISOString().split('T')[0], leads: 0, qualifications: 0, meetings: 0, sales: 0, value: 0, adsInvestment: 0, observations: '' });
    setActiveTab('history');
  };

  const [formData, setFormData] = useState<Omit<DailyMetric, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    leads: 0,
    qualifications: 0,
    meetings: 0,
    sales: 0,
    value: 0,
    adsInvestment: 0,
    observations: ''
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setIsReadingFile(true);
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = (event.target?.result as string).split(',')[1];
          setPendingMedia({ base64, fileName: file.name, mimeType: file.type, size: file.size });
          setIsReadingFile(false);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleStartAnalysis = async () => {
    if (!pendingMedia || !closerForm.closerName) return;
    setIsAnalyzingAudio(true);
    const newRecordingId = Math.random().toString(36).substr(2, 9);
    try {
      const initialRecording: MeetingRecording = {
        id: newRecordingId,
        date: closerForm.date,
        closerName: closerForm.closerName,
        clientName: closerForm.clientName,
        status: 'analyzing'
      };
      setRecordings(prev => [initialRecording, ...prev]);
      const res = await analyzeMeetingRecording(pendingMedia.base64, closerForm.closerName, pendingMedia.mimeType);
      setRecordings(prev => prev.map(r => r.id === newRecordingId ? { ...r, status: 'completed', analysis: res } : r));
      setPendingMedia(null);
      setCloserForm({ closerName: '', clientName: '', date: new Date().toISOString().split('T')[0] });
    } catch (e: any) {
      setRecordings(prev => prev.map(r => r.id === newRecordingId ? { ...r, status: 'error' } : r));
    } finally {
      setIsAnalyzingAudio(false);
    }
  };

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    const newClient: Client = { ...clientForm, id: Math.random().toString(36).substr(2, 9), files: tempClientFiles };
    setClients(prev => [newClient, ...prev]);
    setClientForm({ name: '', company: '', contractDate: new Date().toISOString().split('T')[0], contractValue: 0, qualificationNotes: '', status: 'active' });
    setTempClientFiles([]);
  };

  const handleNewClientFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = (event.target?.result as string).split(',')[1];
          const newAttachment: ClientAttachment = {
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            data: base64,
            mimeType: file.type,
            date: new Date().toISOString()
          };
          setTempClientFiles(prev => [...prev, newAttachment]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const [clientForm, setClientForm] = useState<Omit<Client, 'id' | 'files'>>({
    name: '',
    company: '',
    contractDate: new Date().toISOString().split('T')[0],
    contractValue: 0,
    qualificationNotes: '',
    status: 'active'
  });

  const [suggestionMessage, setSuggestionMessage] = useState('');

  // EXECUTIVE METRICS CALCULATION
  const execMetrics = useMemo(() => {
    const totalRevenue = metrics.reduce((acc, curr) => acc + Number(curr.value), 0);
    const totalAds = metrics.reduce((acc, curr) => acc + (Number(curr.adsInvestment) || 0), 0);
    const totalLeads = metrics.reduce((acc, curr) => acc + Number(curr.leads), 0);
    const totalSales = metrics.reduce((acc, curr) => acc + Number(curr.sales), 0);
    
    // MRR: Somatório dos contratos mensais de clientes ativos
    const mrr = clients
      .filter(c => c.status === 'active')
      .reduce((acc, curr) => acc + Number(curr.contractValue), 0);
    
    const activeClientsCount = clients.filter(c => c.status === 'active').length;
    const cancelledClientsCount = clients.filter(c => c.status === 'cancelled').length;
    
    // Ticket Médio
    const avgTicket = activeClientsCount > 0 ? mrr / activeClientsCount : 0;
    
    // CAC
    const cac = totalSales > 0 ? totalAds / totalSales : 0;
    
    // Conversão Lead -> Contrato
    const convRate = totalLeads > 0 ? (totalSales / totalLeads) * 100 : 0;
    
    // Churn
    const totalHistoryClients = activeClientsCount + cancelledClientsCount;
    const churn = totalHistoryClients > 0 ? (cancelledClientsCount / totalHistoryClients) * 100 : 0;
    
    // Lucratividade (Simplificada: Receita - Ads - Custos Operacionais Fixos Simulados de 20%)
    const opCost = totalRevenue * 0.2;
    const netProfit = totalRevenue - totalAds - opCost;
    const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    
    // Previsibilidade (90 dias baseados no MRR atual)
    const projected90d = mrr * 3;

    return {
      mrr,
      totalRevenue,
      avgTicket,
      totalLeads,
      convRate,
      cac,
      churn,
      activeClientsCount,
      cancelledClientsCount,
      netProfit,
      margin,
      projected90d,
      totalAds,
      opCost
    };
  }, [metrics, clients]);

  return (
    <div className="min-h-screen bg-black flex flex-col md:flex-row text-slate-100 font-sans selection:bg-red-600 selection:text-white relative">
      
      {/* Profile Edit Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsProfileModalOpen(false)}></div>
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 overflow-hidden">
             <div className="p-8 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50">
                <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                  <User size={24} className="text-red-500" /> Perfil & Acesso
                </h3>
                <button onClick={() => setIsProfileModalOpen(false)} className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-slate-500 hover:text-white">
                  <X size={20} />
                </button>
             </div>
             <div className="p-8 space-y-8">
                <div className="bg-black/40 p-5 rounded-2xl border border-zinc-800 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      {isAdmin ? <ShieldCheck size={20} className="text-red-500" /> : <User size={20} className="text-slate-500" />}
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white">Nível de Acesso</p>
                        <p className="text-xs font-bold text-slate-500 uppercase">{isAdmin ? 'Administrador' : 'Colaborador'}</p>
                      </div>
                   </div>
                   <button onClick={() => setProfile({...profile, role: isAdmin ? 'employee' : 'admin'})} className="px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all bg-red-600 text-white">Alternar Função</button>
                </div>
                <div className="flex flex-col items-center">
                   <div onClick={() => avatarInputRef.current?.click()} className="h-24 w-24 rounded-full bg-zinc-950 border-2 border-dashed border-zinc-800 flex items-center justify-center relative cursor-pointer overflow-hidden">
                     {profile.avatar ? <img src={profile.avatar} alt="Avatar" className="h-full w-full object-cover" /> : <User size={32} className="text-zinc-800" />}
                     <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setProfile(prev => ({ ...prev, avatar: reader.result as string }));
                          reader.readAsDataURL(file);
                        }
                     }} />
                   </div>
                </div>
                <FormInput label="Nome Completo" type="text" value={profile.name} onChange={v => setProfile({...profile, name: v})} />
                <button onClick={() => setIsProfileModalOpen(false)} className="w-full bg-red-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px]">Salvar</button>
             </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-zinc-950 border-r border-zinc-800 text-white md:fixed md:h-screen z-20 shadow-2xl flex flex-col">
        <div onClick={() => setIsProfileModalOpen(true)} className="p-6 border-b border-zinc-900/50 cursor-pointer group hover:bg-zinc-900/40 transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-10 w-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-red-500 overflow-hidden">
              {profile.avatar ? <img src={profile.avatar} alt="Profile" className="h-full w-full object-cover" /> : <User size={20} />}
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter italic leading-none transition-colors group-hover:text-red-500"><span className="text-red-600">NORTE</span></h1>
              <p className="text-[8px] uppercase tracking-[0.2em] font-black text-slate-500 mt-1">{isAdmin ? 'Administrador' : 'Colaborador'}</p>
            </div>
          </div>
        </div>
        
        <nav className="mt-4 flex-1 overflow-y-auto">
          <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavItem active={activeTab === 'clientes'} onClick={() => setActiveTab('clientes')} icon={<Users size={20} />} label="Clientes" />
          <NavItem active={activeTab === 'closers'} onClick={() => setActiveTab('closers')} icon={<UserCheck size={20} />} label="Closers & IA" />
          {isAdmin && <NavItem active={activeTab === 'add'} onClick={() => setActiveTab('add')} icon={<PlusCircle size={20} className="text-red-500" />} label="Gestão de Dados" /> }
          <NavItem active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History size={20} />} label="Histórico" />
          <NavItem active={activeTab === 'biblioteca'} onClick={() => setActiveTab('biblioteca')} icon={<Star size={20} className="text-amber-500" />} label="Biblioteca Elite" />
          <NavItem active={activeTab === 'playbook'} onClick={() => setActiveTab('playbook')} icon={<BookOpen size={20} />} label="Playbook" />
          <NavItem active={activeTab === 'planos'} onClick={() => setActiveTab('planos')} icon={<Package size={20} className="text-blue-500" />} label="Planos Norte" />
          <NavItem active={activeTab === 'sugestoes'} onClick={() => setActiveTab('sugestoes')} icon={<Lightbulb size={20} className="text-emerald-500" />} label="Sugestões" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        
        {/* DASHBOARD EXECUTIVO */}
        {activeTab === 'dashboard' && (
          <div className="space-y-10 animate-in fade-in duration-500">
             
             {/* HEADER EXECUTIVO */}
             <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-zinc-900/40 p-8 rounded-[2.5rem] border border-zinc-800 border-l-4 border-l-red-600">
                <div>
                   <h2 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                      <BarChart3 size={32} className="text-red-500" /> Insights Executivos Norte
                   </h2>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">Visão de Alto Nível • Decisões Estratégicas</p>
                </div>
                <div className="flex gap-4">
                   <div className="px-5 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-center">
                      <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Status Operacional</p>
                      <div className="flex items-center gap-2">
                         <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                         <span className="text-xs font-bold text-emerald-400">Escalando</span>
                      </div>
                   </div>
                </div>
             </div>

             {/* SEÇÃO 1: RECEITA & CRESCIMENTO */}
             <section className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                   <DollarSign size={20} className="text-red-500" />
                   <h3 className="text-sm font-black text-white uppercase tracking-widest">Receita & Crescimento</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   <ExecCard label="MRR (Recorrente)" value={`R$ ${execMetrics.mrr.toLocaleString('pt-BR')}`} icon={<Activity size={18} />} trend="+12.5%" trendType="up" />
                   <ExecCard label="Receita Total (Mês)" value={`R$ ${execMetrics.totalRevenue.toLocaleString('pt-BR')}`} icon={<TrendingUp size={18} />} />
                   <ExecCard label="Ticket Médio" value={`R$ ${execMetrics.avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`} icon={<Layers size={18} />} />
                   <ExecCard label="MoM Growth" value="18.2%" icon={<ArrowUpRight size={18} />} trendType="up" />
                </div>
             </section>

             {/* SEÇÃO 2: AQUISIÇÃO & CONVERSÃO */}
             <section className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                   <Target size={20} className="text-red-500" />
                   <h3 className="text-sm font-black text-white uppercase tracking-widest">Aquisição de Clientes</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   <ExecCard label="Leads no Período" value={execMetrics.totalLeads} icon={<Users size={18} />} />
                   <ExecCard label="Taxa Lead → Contrato" value={`${execMetrics.convRate.toFixed(1)}%`} icon={<PieChart size={18} />} trend="Meta: 5%" trendType="neutral" />
                   <ExecCard label="CAC (Custo Aquisição)" value={`R$ ${execMetrics.cac.toLocaleString('pt-BR')}`} icon={<CreditCard size={18} />} trend="-4.2%" trendType="up" />
                   <ExecCard label="Top Lead Source" value="Google Ads" icon={<ExternalLink size={18} />} />
                </div>
             </section>

             {/* SEÇÃO 3: RETENÇÃO & SAÚDE */}
             <section className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                   <ShieldCheck size={20} className="text-red-500" />
                   <h3 className="text-sm font-black text-white uppercase tracking-widest">Saúde da Carteira</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   <ExecCard label="Churn Mensal" value={`${execMetrics.churn.toFixed(1)}%`} icon={<XCircle size={18} />} trendType={execMetrics.churn > 5 ? "down" : "up"} />
                   <ExecCard label="Clientes Ativos" value={execMetrics.activeClientsCount} icon={<UserCheck size={18} />} />
                   <ExecCard label="Churn (Clientes)" value={execMetrics.cancelledClientsCount} icon={<Trash2 size={18} />} />
                   <ExecCard label="LTV Médio" value="8.4 Meses" icon={<Calendar size={18} />} />
                </div>
             </section>

             {/* SEÇÃO 4: LUCRATIVIDADE & PREVISÃO */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <section className="lg:col-span-2 space-y-6">
                   <div className="flex items-center gap-3 px-2">
                      <Zap size={20} className="text-red-500" />
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">Lucratividade & Margem</h3>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><DollarSign size={60} /></div>
                         <p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">Lucro Líquido Estimado</p>
                         <p className="text-3xl font-black text-emerald-400 tracking-tighter">R$ {execMetrics.netProfit.toLocaleString('pt-BR')}</p>
                         <p className="text-[8px] font-bold text-slate-600 mt-2">Dedução: Ads + OpCost (20%)</p>
                      </div>
                      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] flex flex-col justify-center">
                         <p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">Margem Líquida</p>
                         <p className="text-3xl font-black text-white tracking-tighter">{execMetrics.margin.toFixed(1)}%</p>
                      </div>
                      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] flex flex-col justify-center">
                         <p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">Op. Cost</p>
                         <p className="text-xl font-black text-slate-400 tracking-tighter">R$ {execMetrics.opCost.toLocaleString('pt-BR')}</p>
                      </div>
                   </div>
                </section>

                <section className="space-y-6">
                   <div className="flex items-center gap-3 px-2">
                      <Bot size={20} className="text-red-500" />
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">Previsibilidade</h3>
                   </div>
                   <div className="bg-red-600/10 border border-red-600/20 p-8 rounded-[2.5rem] flex flex-col justify-between h-[210px] relative">
                      <div>
                         <p className="text-[10px] font-black text-red-500 uppercase mb-2 tracking-widest">Projeção 90 dias</p>
                         <p className="text-4xl font-black text-white tracking-tighter">R$ {execMetrics.projected90d.toLocaleString('pt-BR')}</p>
                      </div>
                      <div className="bg-black/40 p-4 rounded-2xl border border-zinc-800">
                         <div className="flex justify-between items-center mb-2">
                            <span className="text-[9px] font-black text-slate-400 uppercase">Receita Garantida</span>
                            <span className="text-[9px] font-black text-emerald-400">92%</span>
                         </div>
                         <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full w-[92%]" />
                         </div>
                      </div>
                   </div>
                </section>
             </div>

             {/* BOTÃO DE DECISÃO RÁPIDA (IA) - INTEGRATED */}
             <div className="bg-zinc-950 border border-zinc-800 p-10 rounded-[3rem] group hover:border-red-600 transition-all relative overflow-hidden">
                {!commercialInsight && !isGeneratingInsight && (
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                    <div className="flex items-center gap-6 text-center md:text-left">
                       <div className="h-16 w-16 rounded-full bg-red-600 flex items-center justify-center text-white shadow-xl shadow-red-950/40">
                          <BrainCircuit size={32} />
                       </div>
                       <div>
                          <h4 className="text-xl font-black text-white uppercase tracking-tight">Análise Estratégica IA</h4>
                          <p className="text-slate-500 text-xs font-medium">
                             {metrics.length > 0 
                               ? "O Norte AI está pronto para processar seus dados comerciais." 
                               : "Insira dados de métricas para habilitar a inteligência artificial."}
                          </p>
                       </div>
                    </div>
                    <button 
                      onClick={handleGenerateInsight} 
                      disabled={metrics.length === 0}
                      className="px-10 py-5 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-red-600 hover:text-white transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                       <Sparkles size={16} /> {metrics.length > 0 ? "Gerar Relatório Estratégico" : "Sem Dados"}
                    </button>
                  </div>
                )}

                {isGeneratingInsight && (
                  <div className="flex flex-col items-center justify-center py-8 relative z-10">
                     <Loader2 size={40} className="text-red-500 animate-spin mb-4" />
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">Processando Inteligência de Mercado...</p>
                  </div>
                )}

                {commercialInsight && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
                     <div className="flex justify-between items-start mb-6 border-b border-zinc-800 pb-6">
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-red-600/10 rounded-xl text-red-500">
                              <BrainCircuit size={24} />
                           </div>
                           <div>
                              <h4 className="text-lg font-black text-white uppercase tracking-tight">Relatório de Inteligência Norte</h4>
                              <div className="flex items-center gap-2 mt-1">
                                 <div className={`h-2 w-2 rounded-full ${commercialInsight.status === 'positive' ? 'bg-emerald-500' : commercialInsight.status === 'negative' ? 'bg-red-500' : 'bg-amber-500'}`} />
                                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{commercialInsight.status === 'positive' ? 'Cenário Positivo' : commercialInsight.status === 'negative' ? 'Atenção Crítica' : 'Estável'}</span>
                              </div>
                           </div>
                        </div>
                        <button onClick={() => setCommercialInsight(null)} className="p-2 hover:bg-zinc-800 rounded-full text-slate-500 hover:text-white transition-colors">
                           <X size={20} />
                        </button>
                     </div>
                     
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                           <p className="text-slate-300 text-sm leading-relaxed font-medium mb-6">
                              {commercialInsight.analysis}
                           </p>
                           <div className="flex gap-4">
                               <button className="px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-[9px] font-black uppercase text-slate-400 hover:text-white hover:border-red-600 transition-all">Exportar PDF</button>
                               <button onClick={() => setActiveTab('sugestoes')} className="px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-[9px] font-black uppercase text-slate-400 hover:text-white hover:border-emerald-500 transition-all">Discutir com IA</button>
                           </div>
                        </div>
                        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                           <h5 className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <Target size={14} /> Ações Recomendadas
                           </h5>
                           <ul className="space-y-4">
                              {commercialInsight.suggestions.map((s, i) => (
                                 <li key={i} className="flex gap-3 text-xs text-slate-400 font-medium">
                                    <span className="text-red-600 font-bold">•</span>
                                    {s}
                                 </li>
                              ))}
                           </ul>
                        </div>
                     </div>
                  </div>
                )}
             </div>

          </div>
        )}

        {/* HISTÓRICO */}
        {activeTab === 'history' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-zinc-900/40 px-8 py-6 rounded-3xl border border-zinc-800 flex justify-between items-center shadow-xl">
              <h2 className="text-2xl font-black text-white flex items-center gap-4 uppercase tracking-tighter">
                <History size={28} className="text-red-500" /> Registro Histórico
              </h2>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{metrics.length} Entradas</div>
            </div>
            <div className="space-y-4">
              {metrics.length === 0 ? (
                <div className="text-center py-24 bg-zinc-900/20 rounded-3xl border border-dashed border-zinc-800">
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Sem dados registrados</p>
                </div>
              ) : (
                metrics.map((m) => (
                  <div key={m.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-red-600 transition-all">
                    <div className="flex items-center gap-6">
                      <div className="h-16 w-16 rounded-2xl bg-black border border-zinc-800 flex items-center justify-center">
                        <span className="text-[10px] font-black text-red-500 uppercase">{new Date(m.date).toLocaleDateString('pt-BR', { month: 'short' })}</span>
                        <span className="text-xl font-black text-white">{new Date(m.date).toLocaleDateString('pt-BR', { day: '2-digit' })}</span>
                      </div>
                      <div>
                        <h4 className="font-black text-white text-lg">Invest: R$ {m.adsInvestment.toLocaleString('pt-BR')}</h4>
                        <p className="text-slate-500 text-[10px] font-bold uppercase">Vendas: {m.sales} • Fatur: R$ {m.value.toLocaleString('pt-BR')}</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <button onClick={() => setMetrics(metrics.filter(item => item.id !== m.id))} className="p-3 bg-zinc-800 text-slate-500 rounded-xl hover:bg-red-600 hover:text-white transition-all">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* CLOSERS & IA */}
        {activeTab === 'closers' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* PAINEL DE FEEDBACK DE VENDA (DIÁRIO, SEMANAL, MENSAL) */}
            <div className="bg-zinc-900 p-8 rounded-[3rem] border border-zinc-800 shadow-2xl overflow-hidden relative">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <LineChart size={100} />
               </div>
               <div className="relative z-10">
                  <h2 className="text-3xl font-black text-white flex items-center gap-4 uppercase tracking-tighter mb-8">
                    <Zap size={32} className="text-red-500" /> Painel de Feedback da Venda
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <button onClick={() => handleGenerateReport('Diário')} className="group p-8 bg-black border border-zinc-800 rounded-[2.5rem] hover:border-red-600 transition-all text-center flex flex-col items-center">
                        <CalendarDays size={32} className="text-red-500 mb-4 group-hover:scale-110 transition-transform" />
                        <h4 className="text-white font-black uppercase text-[11px] tracking-widest">Feedback Diário</h4>
                        <p className="text-slate-500 text-[9px] font-bold mt-2 uppercase tracking-tight">Análise Imediata das Calls</p>
                     </button>
                     <button onClick={() => handleGenerateReport('Semanal')} className="group p-8 bg-black border border-zinc-800 rounded-[2.5rem] hover:border-red-600 transition-all text-center flex flex-col items-center">
                        <CalendarRange size={32} className="text-red-500 mb-4 group-hover:scale-110 transition-transform" />
                        <h4 className="text-white font-black uppercase text-[11px] tracking-widest">Feedback Semanal</h4>
                        <p className="text-slate-500 text-[9px] font-bold mt-2 uppercase tracking-tight">Evolução e Consistência</p>
                     </button>
                     <button onClick={() => handleGenerateReport('Mensal')} className="group p-8 bg-black border border-zinc-800 rounded-[2.5rem] hover:border-red-600 transition-all text-center flex flex-col items-center">
                        <LineChart size={32} className="text-red-500 mb-4 group-hover:scale-110 transition-transform" />
                        <h4 className="text-white font-black uppercase text-[11px] tracking-widest">Feedback Mensal</h4>
                        <p className="text-slate-500 text-[9px] font-bold mt-2 uppercase tracking-tight">Performance Estratégica</p>
                     </button>
                  </div>

                  {/* Relatório de Feedback IA */}
                  {(isGeneratingReport || salesReport) && (
                    <div className="mt-8 bg-black/80 border border-zinc-800 p-10 rounded-[2.5rem] animate-in slide-in-from-top-4 duration-500 shadow-2xl">
                       <div className="flex justify-between items-center mb-8 pb-4 border-b border-zinc-800">
                          <h5 className="text-red-500 font-black uppercase text-[10px] tracking-[0.3em] flex items-center gap-3">
                             <Bot size={20} /> Relatório de Feedback {reportPeriod} • Norte AI
                          </h5>
                          <button onClick={() => setSalesReport(null)} className="p-2 hover:bg-zinc-800 rounded-full transition-all text-slate-500 hover:text-white">
                             <X size={20} />
                          </button>
                       </div>
                       {isGeneratingReport ? (
                          <div className="flex flex-col items-center py-16 gap-6">
                             <Loader2 size={40} className="text-red-600 animate-spin" />
                             <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] animate-pulse">Compilando arsenal de vendas...</p>
                          </div>
                       ) : (
                          <div className="text-sm text-slate-300 leading-relaxed font-medium prose prose-invert max-w-none whitespace-pre-line bg-zinc-950/40 p-6 rounded-2xl border border-zinc-900">
                             {salesReport}
                          </div>
                       )}
                    </div>
                  )}
               </div>
            </div>

            {/* AUDITORIA DE VÍDEO INDIVIDUAL */}
            <div className="bg-zinc-900 p-10 rounded-[3rem] border border-zinc-800 shadow-2xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                <div>
                  <h2 className="text-4xl font-black text-white flex items-center gap-4 uppercase tracking-tighter">
                    <Video size={40} className="text-red-500" /> Auditoria de Vídeo
                  </h2>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">Envie uma gravação para análise técnica profunda</p>
                </div>
                
                {/* BOTÃO PRINCIPAL: COMEÇAR ANALISAR VÍDEO */}
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="bg-red-600 hover:bg-red-500 text-white px-10 py-6 rounded-[2rem] font-black uppercase tracking-widest text-[11px] flex items-center gap-4 shadow-xl shadow-red-950/50 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <PlusCircle size={22} /> Começar Analisar Vídeo
                  <input type="file" ref={fileInputRef} className="hidden" accept="video/*,audio/*" onChange={handleFileUpload} />
                </button>
              </div>

              {pendingMedia && (
                <div className="bg-black/60 border border-zinc-800 p-10 rounded-[2.5rem] mb-12 animate-in zoom-in-95 duration-500">
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <div className="space-y-6">
                         <FormInput label="Nome do Closer" type="text" value={closerForm.closerName} onChange={v => setCloserForm({...closerForm, closerName: v})} />
                         <FormInput label="Cliente / Oportunidade" type="text" value={closerForm.clientName} onChange={v => setCloserForm({...closerForm, clientName: v})} />
                      </div>
                      <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-[2.5rem] p-10 bg-zinc-900/30">
                         <div className="h-20 w-20 rounded-full bg-red-600/10 flex items-center justify-center mb-4">
                            <FileVideo size={32} className="text-red-500" />
                         </div>
                         <p className="text-white font-black uppercase text-[10px] tracking-widest mb-1">{pendingMedia.fileName}</p>
                         <p className="text-slate-600 text-[8px] font-bold uppercase tracking-widest">Tamanho: {(pendingMedia.size / 1024 / 1024).toFixed(2)} MB</p>
                         
                         <button 
                           disabled={isAnalyzingAudio || !closerForm.closerName} 
                           onClick={handleStartAnalysis} 
                           className="w-full mt-8 bg-white text-black py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-lg hover:bg-zinc-200 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                         >
                            {isAnalyzingAudio ? <><Loader2 size={18} className="animate-spin" /> Auditando...</> : 'Iniciar Auditoria de Venda'}
                         </button>
                      </div>
                   </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {recordings.length === 0 ? (
                  <div className="lg:col-span-2 text-center py-20 bg-black/20 rounded-[2.5rem] border border-dashed border-zinc-800">
                    <p className="text-slate-600 font-black uppercase tracking-[0.2em] text-[10px]">Nenhuma auditoria realizada</p>
                  </div>
                ) : (
                  recordings.map((rec) => (
                    <div key={rec.id} className="group bg-black/40 border border-zinc-800 rounded-[2.5rem] p-10 hover:border-red-600 transition-all shadow-xl">
                      <div className="flex justify-between items-start mb-8">
                        <div>
                          <h4 className="text-2xl font-black text-white tracking-tight group-hover:text-red-500 transition-colors">{rec.clientName}</h4>
                          <div className="flex items-center gap-3 mt-2">
                             <div className="h-6 w-6 rounded-full bg-zinc-800 flex items-center justify-center">
                                <User size={12} className="text-slate-400" />
                             </div>
                             <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{rec.closerName}</p>
                          </div>
                        </div>
                        <div className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border ${rec.status === 'completed' ? 'bg-emerald-600/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-600/10 text-amber-500 border-amber-500/20'}`}>
                          {rec.status === 'completed' ? 'Auditoria Concluída' : 'Em Análise'}
                        </div>
                      </div>
                      {rec.status === 'completed' && rec.analysis && (
                        <div className="flex items-center gap-6 bg-zinc-950/80 p-8 rounded-[2rem] border border-zinc-900 shadow-inner">
                          <div className="relative h-20 w-20 shrink-0">
                            <svg className="h-20 w-20 transform -rotate-90">
                              <circle cx="40" cy="40" r="35" fill="transparent" stroke="currentColor" strokeWidth="6" className="text-zinc-900" />
                              <circle cx="40" cy="40" r="35" fill="transparent" stroke="currentColor" strokeWidth="6" className="text-red-600" strokeDasharray={`${rec.analysis.overallScore * 2.2} 220`} strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center text-2xl font-black text-white">
                              {rec.analysis.overallScore}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-300 italic line-clamp-3">"{rec.analysis.summary}"</p>
                            <button className="mt-3 text-[9px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1 hover:text-white transition-colors">
                               Ver Detalhes Técnicos <ChevronRight size={12} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* BIBLIOTECA */}
        {activeTab === 'biblioteca' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="bg-amber-950/20 px-10 py-8 rounded-[3rem] border border-amber-900/30 flex justify-between items-center shadow-xl">
               <h2 className="text-3xl font-black text-white flex items-center gap-4 uppercase tracking-tighter">
                  <Star size={32} className="text-amber-500" /> Biblioteca Elite
               </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {[1, 2, 3].map(i => (
                 <div key={i} className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 group hover:border-amber-600 transition-all">
                    <Quote size={32} className="text-amber-500/20 mb-6" />
                    <h5 className="text-xl font-black text-white mb-4 tracking-tight uppercase">Objeção: "Vou pensar"</h5>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed italic">"Norte Assessoria não vende serviço, vende previsibilidade comercial."</p>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* PLAYBOOK */}
        {activeTab === 'playbook' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-zinc-900 p-10 rounded-[3rem] border border-zinc-800 shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
                <div>
                  <h2 className="text-3xl font-black text-white flex items-center gap-4 uppercase tracking-tighter">
                    <BookOpen size={32} className="text-red-500" /> Playbook de Processos
                  </h2>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">Doutrina e Operação Padrão Norte Assessoria</p>
                </div>

                <div className="flex bg-black p-2 rounded-2xl border border-zinc-800">
                  <button 
                    onClick={() => setPlaybookSubTab('SDR')}
                    className={`px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 ${playbookSubTab === 'SDR' ? 'bg-red-600 text-white shadow-lg shadow-red-950/40' : 'text-slate-500 hover:text-white'}`}
                  >
                    <Headset size={14} /> SDR (Pré-Venda)
                  </button>
                  <button 
                    onClick={() => setPlaybookSubTab('Closer')}
                    className={`px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 ${playbookSubTab === 'Closer' ? 'bg-red-600 text-white shadow-lg shadow-red-950/40' : 'text-slate-500 hover:text-white'}`}
                  >
                    <Handshake size={14} /> Closer (Fechamento)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-6">
                   <div className="bg-zinc-950/50 p-8 rounded-[2rem] border border-zinc-800">
                      <h6 className="text-[10px] font-black text-red-500 uppercase mb-6 tracking-widest flex items-center gap-2">
                        <FileText size={14} /> Documentos {playbookSubTab}
                      </h6>
                      <div className="space-y-3">
                        {(playbookSubTab === 'SDR' ? 
                          ['Script Cold Call V2', 'Planilha de Qualificação', 'Cadência de Prospecção', 'Perguntas de Filtro'] : 
                          ['Roteiro de Diagnóstico', 'Tabela de Investimentos', 'Cláusulas de Contrato', 'Apresentação de Impacto']
                        ).map((t, i) => (
                          <button key={i} className="w-full group text-left p-5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-red-600/50 text-slate-300 font-bold text-xs transition-all flex items-center justify-between">
                             {t}
                             <ChevronRight size={14} className="text-zinc-700 group-hover:text-red-500 transition-colors" />
                          </button>
                        ))}
                      </div>
                   </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                   <div className="bg-black/40 p-10 rounded-[2.5rem] border border-zinc-800 min-h-[400px]">
                      <div className="flex items-center gap-4 mb-8">
                         <div className="h-12 w-12 rounded-2xl bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-500">
                            {playbookSubTab === 'SDR' ? <Target size={24} /> : <Zap size={24} />}
                         </div>
                         <div>
                            <h4 className="text-2xl font-black text-white uppercase tracking-tight">Guia de Performance: {playbookSubTab}</h4>
                         </div>
                      </div>
                      
                      <div className="space-y-8">
                         <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/50">
                            <h5 className="text-white font-black uppercase text-xs mb-4 flex items-center gap-2">
                               <Info size={14} className="text-red-500" /> Objetivo Principal
                            </h5>
                            <p className="text-slate-400 text-sm leading-relaxed">
                               {playbookSubTab === 'SDR' ? 
                                 "Identificar leads com perfil ideal (ICP), descobrir a dor latente e agendar reuniões qualificadas para o Closer. O SDR é o filtro da agência." : 
                                 "Transformar a dor do lead em solução, apresentar a previsibilidade Norte e garantir a assinatura do contrato com foco em LTV e Scale."}
                            </p>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CLIENTES */}
        {activeTab === 'clientes' && (
           <div className="space-y-8 animate-in fade-in duration-500">
             {selectedClient ? (
              <div className="animate-in slide-in-from-left duration-300">
                <button onClick={() => setSelectedClient(null)} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors font-black uppercase text-[10px] tracking-widest">
                  <ArrowLeft size={14} /> Voltar
                </button>
                <div className="bg-zinc-900 rounded-[2.5rem] border border-zinc-800 overflow-hidden shadow-2xl">
                  <div className="p-12 border-b border-zinc-800 flex justify-between items-start bg-zinc-900/50">
                    <div>
                      <h2 className="text-5xl font-black text-white tracking-tighter">{selectedClient.name}</h2>
                      <p className="text-slate-400 font-bold text-2xl mt-1 italic">{selectedClient.company}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="bg-red-950/20 px-10 py-6 rounded-3xl border border-red-900/30 mb-8 flex justify-between items-center shadow-xl">
                  <h2 className="text-2xl font-black text-white flex items-center gap-4 uppercase tracking-tighter">
                    <Briefcase size={28} className="text-red-500" /> Carteira Norte
                  </h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                  {isAdmin && (
                    <div className="lg:col-span-1">
                      <div className="bg-zinc-900 p-10 rounded-[2rem] border border-zinc-800 shadow-2xl">
                         <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3 uppercase tracking-tighter">Ativar Cliente</h3>
                         <form onSubmit={handleAddClient} className="space-y-6">
                            <FormInput label="Nome" type="text" value={clientForm.name} onChange={v => setClientForm({...clientForm, name: v})} />
                            <FormInput label="Empresa" type="text" value={clientForm.company} onChange={v => setClientForm({...clientForm, company: v})} />
                            <FormInput label="Valor Contrato" type="number" step="0.01" value={clientForm.contractValue} onChange={v => setClientForm({...clientForm, contractValue: parseFloat(v) || 0})} />
                            <div className="space-y-3">
                               <label className="block text-[10px] font-black text-slate-500 uppercase">Status</label>
                               <select 
                                 value={clientForm.status} 
                                 onChange={e => setClientForm({...clientForm, status: e.target.value as any})}
                                 className="w-full px-6 py-4 rounded-2xl bg-black border border-zinc-800 text-white outline-none focus:ring-2 focus:ring-red-600 transition-all font-bold text-sm"
                               >
                                  <option value="active">Ativo</option>
                                  <option value="completed">Finalizado</option>
                                  <option value="paused">Pausado</option>
                                  <option value="cancelled">Cancelado (Churn)</option>
                               </select>
                            </div>
                            <div className="space-y-3">
                              <label className="block text-[10px] font-black text-slate-500 uppercase">Arquivos</label>
                              <button type="button" onClick={() => newClientFilesInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-zinc-800 rounded-2xl text-[10px] font-black uppercase text-slate-500">
                                <Paperclip size={14} /> Anexar
                                <input type="file" multiple ref={newClientFilesInputRef} className="hidden" onChange={handleNewClientFilesChange} />
                              </button>
                            </div>
                            <button type="submit" className="w-full py-5 bg-emerald-600 text-white font-black rounded-2xl transition-all uppercase tracking-widest text-[10px]">Cadastrar Cliente</button>
                         </form>
                      </div>
                    </div>
                  )}
                  <div className={`${isAdmin ? 'lg:col-span-3' : 'lg:col-span-4'} grid grid-cols-1 md:grid-cols-2 gap-8`}>
                    {clients.map(client => (
                      <div key={client.id} onClick={() => setSelectedClient(client)} className="bg-zinc-900 p-10 rounded-[2rem] border border-zinc-800 hover:border-red-600 cursor-pointer transition-all shadow-2xl group">
                        <div className="flex justify-between items-start">
                           <div>
                              <h4 className="text-3xl font-black text-white tracking-tighter group-hover:text-red-500 transition-colors">{client.name}</h4>
                              <p className="text-lg text-slate-400 font-bold italic">{client.company}</p>
                           </div>
                           <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${client.status === 'cancelled' ? 'bg-red-600/10 border-red-600 text-red-500' : 'bg-emerald-600/10 border-emerald-600 text-emerald-500'}`}>
                              {client.status}
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
           </div>
        )}

        {/* PLANOS */}
        {activeTab === 'planos' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-red-950/20 px-8 py-6 rounded-3xl border border-red-900/30 flex justify-between items-center shadow-2xl">
              <h2 className="text-3xl font-black text-white flex items-center gap-4 uppercase tracking-tighter">
                <CreditCard size={32} className="text-red-500" /> Planos Norte
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
               {[
                 { name: 'Plano Silver', desc: 'Gestão essencial de tráfego e otimização de funil comercial.' },
                 { name: 'Plano Gold', desc: 'Escala acelerada, automação de vendas e CRM inteligente.' },
                 { name: 'Plano Exclusive', desc: 'Consultoria master 1-on-1, growth hacking completo e scale-up.' }
               ].map((p, i) => (
                 <div key={i} className="bg-zinc-900 p-10 rounded-[2.5rem] border border-zinc-800 border-t-8 border-t-red-600 hover:border-red-500 transition-all shadow-xl group">
                    <div className="h-14 w-14 bg-red-600/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                       <Package size={28} className="text-red-500" />
                    </div>
                    <h5 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">{p.name}</h5>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">{p.desc}</p>
                    <button className="mt-8 w-full py-4 bg-zinc-950 border border-zinc-800 rounded-xl text-[10px] font-black uppercase text-slate-500 tracking-widest hover:bg-red-600 hover:text-white transition-all">Ver Detalhes do Plano</button>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* GESTÃO DE DADOS */}
        {activeTab === 'add' && isAdmin && (
          <div className="max-w-4xl mx-auto bg-zinc-900 p-12 rounded-[3rem] shadow-2xl border border-zinc-800 animate-in zoom-in-95 duration-500">
             <div className="mb-12">
               <h3 className="text-4xl font-black text-white mb-3 uppercase tracking-tighter flex items-center gap-4">
                 <ShieldCheck size={36} className="text-red-500" /> Console Master
               </h3>
               <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Lançamento de Métricas Oficiais</p>
             </div>
             <form onSubmit={handleAddMetric} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <FormInput label="Data" type="date" value={formData.date} onChange={v => setFormData({...formData, date: v})} />
                <FormInput label="Invest. Ads" type="number" step="0.01" value={formData.adsInvestment} onChange={v => setFormData({...formData, adsInvestment: parseFloat(v) || 0})} />
                <FormInput label="Total Leads" type="number" value={formData.leads} onChange={v => setFormData({...formData, leads: parseInt(v) || 0})} />
                <FormInput label="Qualificações" type="number" value={formData.qualifications} onChange={v => setFormData({...formData, qualifications: parseInt(v) || 0})} />
                <FormInput label="Vendas" type="number" value={formData.sales} onChange={v => setFormData({...formData, sales: parseInt(v) || 0})} />
                <FormInput label="Faturamento" type="number" step="0.01" value={formData.value} onChange={v => setFormData({...formData, value: parseFloat(v) || 0})} />
              </div>
              <button type="submit" className="w-full py-6 bg-red-700 text-white font-black rounded-[2rem] hover:bg-red-600 transition-all uppercase text-xs">Sincronizar Dados</button>
            </form>
          </div>
        )}

        {/* SUGESTÕES & IA SALES ASSISTANT */}
        {activeTab === 'sugestoes' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-120px)] animate-in fade-in duration-500">
            <div className="flex flex-col bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] overflow-hidden">
              <div className="p-8 border-b border-zinc-800 bg-zinc-900/50 flex items-center gap-4">
                <Lightbulb size={28} className="text-emerald-500" />
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">Sugestões Norte</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {suggestions.map((s) => (
                  <div key={s.id} className="flex gap-4 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="h-10 w-10 rounded-full border border-zinc-800 bg-zinc-900 shrink-0 flex items-center justify-center text-slate-600">
                      {s.userAvatar ? <img src={s.userAvatar} className="h-full w-full rounded-full object-cover" /> : <User size={20} />}
                    </div>
                    <div className="flex-1 bg-black/40 border border-zinc-800 p-5 rounded-2xl shadow-xl">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-white text-[10px] font-black uppercase">{s.userName}</p>
                        <span className="text-[8px] font-bold text-slate-600 uppercase">{new Date(s.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed">{s.message}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={(e) => {
                 e.preventDefault();
                 if (!suggestionMessage.trim()) return;
                 const newS: Suggestion = { id: Math.random().toString(), userName: profile.name, message: suggestionMessage, timestamp: new Date().toISOString(), category: 'Processo', status: 'Analise' };
                 setSuggestions([...suggestions, newS]);
                 setSuggestionMessage('');
              }} className="p-6 bg-zinc-950/80 border-t border-zinc-800 flex gap-4">
                 <input type="text" value={suggestionMessage} onChange={e => setSuggestionMessage(e.target.value)} placeholder="O que podemos melhorar no processo?" className="flex-1 bg-black border border-zinc-800 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none" />
                 <button type="submit" className="h-14 w-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl flex items-center justify-center"><Send size={24} /></button>
              </form>
            </div>
            <div className="flex flex-col bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
              <div className="p-8 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-red-600 rounded-xl flex items-center justify-center animate-pulse">
                    <Zap size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter">Norte AI Sales Assistant</h2>
                  </div>
                </div>
              </div>
              <div className="px-8 pt-6 pb-2 grid grid-cols-3 gap-3">
                 <button onClick={() => handleAskAi("Me dê 5 palavras-chave potentes para FECHAMENTO IMEDIATO")} className="p-3 bg-black/40 border border-zinc-800 rounded-xl hover:border-red-600 transition-all flex flex-col items-center gap-2 group">
                    <Trophy size={16} className="text-amber-500" />
                    <span className="text-[8px] font-black text-slate-500 uppercase">Fechamento</span>
                 </button>
                 <button onClick={() => handleAskAi("Me dê palavras para criar RAPPORT")} className="p-3 bg-black/40 border border-zinc-800 rounded-xl hover:border-red-600 transition-all flex flex-col items-center gap-2 group">
                    <UserPlus size={16} className="text-blue-500" />
                    <span className="text-[8px] font-black text-slate-500 uppercase">Rapport</span>
                 </button>
                 <button onClick={() => handleAskAi("Quebre a objeção: 'ESTÁ CARO'")} className="p-3 bg-black/40 border border-zinc-800 rounded-xl hover:border-red-600 transition-all flex flex-col items-center gap-2 group">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    <span className="text-[8px] font-black text-slate-500 uppercase">Objeções</span>
                 </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {aiChatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in zoom-in-95`}>
                    <div className={`max-w-[85%] p-5 rounded-3xl border ${msg.role === 'user' ? 'bg-red-600 text-white border-red-500 rounded-tr-none' : 'bg-black/60 text-slate-200 border-zinc-800 rounded-tl-none'}`}>
                      <p className="text-sm font-medium leading-relaxed whitespace-pre-line">{msg.text}</p>
                    </div>
                  </div>
                ))}
                {isAiThinking && (
                  <div className="flex justify-start">
                    <div className="bg-zinc-800/40 p-4 rounded-2xl flex items-center gap-3">
                      <Loader2 size={16} className="animate-spin text-red-500" />
                    </div>
                  </div>
                )}
                <div ref={aiChatEndRef} />
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleAskAi(aiInput); setAiInput(''); }} className="p-6 bg-zinc-950/50 border-t border-zinc-800 flex gap-4">
                <input type="text" value={aiInput} onChange={e => setAiInput(e.target.value)} placeholder="Dificuldade de venda?" className="flex-1 bg-black border border-zinc-800 rounded-2xl px-6 py-5 text-sm font-bold text-white outline-none focus:border-red-600" />
                <button type="submit" disabled={isAiThinking} className="h-16 w-16 bg-red-600 hover:bg-red-500 text-white rounded-2xl flex items-center justify-center transition-all disabled:opacity-50">
                  <Wand2 size={28} />
                </button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

// ExecCard Elite para o Dashboard Executivo
const ExecCard: React.FC<{ label: string, value: string | number, icon: React.ReactNode, trend?: string, trendType?: 'up' | 'down' | 'neutral' }> = ({ label, value, icon, trend, trendType }) => (
  <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] hover:border-red-600 transition-all group flex flex-col justify-between">
    <div className="flex items-center justify-between mb-4">
       <div className="h-10 w-10 rounded-xl bg-zinc-950 flex items-center justify-center text-slate-500 group-hover:text-red-500 transition-colors">
          {icon}
       </div>
       {trend && (
         <div className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest ${trendType === 'up' ? 'text-emerald-500' : trendType === 'down' ? 'text-red-500' : 'text-slate-500'}`}>
            {trendType === 'up' ? <ArrowUpRight size={12} /> : trendType === 'down' ? <ArrowDownRight size={12} /> : null}
            {trend}
         </div>
       )}
    </div>
    <div>
       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
       <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
    </div>
  </div>
);

// Sub-componentes Elite
const NavItem: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`w-full flex items-center space-x-4 px-8 py-6 transition-all duration-300 relative group ${active ? 'bg-red-700/5 text-white' : 'text-slate-500 hover:bg-zinc-900 hover:text-slate-200'}`}>
    {active && <div className="absolute left-0 w-1.5 h-full bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]" />}
    <div className={`${active ? 'scale-125 text-red-500' : 'group-hover:scale-110'} transition-transform duration-300`}>{icon}</div>
    <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${active ? 'text-white' : ''}`}>{label}</span>
  </button>
);

const FormInput: React.FC<{ label: string, type: string, value: any, onChange: (v: string) => void, step?: string }> = ({ label, type, value, onChange, step }) => (
  <div className="group relative">
    <label className="block text-[10px] font-black text-slate-500 mb-3 uppercase tracking-[0.2em]">{label}</label>
    <input type={type} step={step} value={value} onChange={e => onChange(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-black border border-zinc-800 text-white outline-none focus:ring-2 focus:ring-red-600 transition-all font-bold text-lg" />
  </div>
);

export default App;