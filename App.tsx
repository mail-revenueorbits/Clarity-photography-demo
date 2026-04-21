
import React, { useState, useEffect } from 'react';
import { Session, Lead } from './types';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import SessionsList from './components/SessionsList';
import SessionDetailView from './components/SessionDetailView';
import FollowUps from './components/FollowUps';
import LeadsView from './components/LeadsView';
import LeadDetailView from './components/LeadDetailView';
import LeadFormModal from './components/LeadFormModal';
import Auth from './components/Auth';
import BookingForm from './components/BookingForm';
import { LayoutDashboard, Calendar, Menu, X, Users, Loader2, LogOut, Trash2, Heart, UserPlus } from 'lucide-react';
import { sessionService } from './services/sessionService';
import { leadService } from './services/leadService';
const ClarityIcon = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <g>
      <path d="m9.25 0h-7.5c-.965 0-1.75.785-1.75 1.75v4.5c0 .965.785 1.75 1.75 1.75h7.5c.965 0 1.75-.785 1.75-1.75v-4.5c0-.965-.785-1.75-1.75-1.75z"/>
      <path d="m9.25 10h-7.5c-.965 0-1.75.785-1.75 1.75v10.5c0 .965.785 1.75 1.75 1.75h7.5c.965 0 1.75-.785 1.75-1.75v-10.5c0-.965-.785-1.75-1.75-1.75z"/>
      <path d="m22.25 16h-7.5c-.965 0-1.75.785-1.75 1.75v4.5c0 .965.785 1.75 1.75 1.75h7.5c.965 0 1.75-.785 1.75-1.75v-4.5c0-.965-.785-1.75-1.75-1.75z"/>
      <path d="m22.25 0h-7.5c-.965 0-1.75.785-1.75 1.75v10.5c0 .965.785 1.75 1.75 1.75h7.5c.965 0 1.75-.785 1.75-1.75v-10.5c0-.965-.785-1.75-1.75-1.75z"/>
    </g>
  </svg>
);

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isSplashFading, setIsSplashFading] = useState(false);
  const [userSession, setUserSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'sessions' | 'leads' | 'details' | 'trash' | 'followups' | 'lead-details'>('calendar');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [deletedSessions, setDeletedSessions] = useState<Session[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

  // Session Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | undefined>(undefined);
  const [newBookingDate, setNewBookingDate] = useState<string>('');
  const [newBookingSlot, setNewBookingSlot] = useState<number | undefined>(undefined);

  // Lead Modal State
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  useEffect(() => {
    // Require login every time on load
    setUserSession(null);
    setAuthLoading(false);
  }, []);

  useEffect(() => {
    // Start fade out at 2.5s
    const fadeTimer = setTimeout(() => setIsSplashFading(true), 2500);
    // Remove from DOM at 3.2s (allowing 700ms for transition)
    const removeTimer = setTimeout(() => setShowSplash(false), 3200);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  useEffect(() => {
    if (!userSession) return;
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [active, deleted, leadsData] = await Promise.all([
          sessionService.fetchSessions(),
          sessionService.fetchDeletedSessions(),
          leadService.fetchLeads()
        ]);
        setSessions(active);
        setDeletedSessions(deleted);
        setLeads(leadsData);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [userSession]);

  const handleSignOut = async () => {
    setUserSession(null);
  };

  // --- Session Handlers ---
  const handleOpenNewBooking = (date: string, slotId?: number) => {
    setEditingSession(undefined);
    setNewBookingDate(date);
    setNewBookingSlot(slotId);
    setIsBookingModalOpen(true);
  };

  const handleOpenEditBooking = (session: Session) => {
    setEditingSession(session);
    setNewBookingDate(session.date);
    setIsBookingModalOpen(true);
  };

  const handleSaveSession = async (session: Session) => {
    const wasInTrash = deletedSessions.some(s => s.id === session.id);
    if (session.isDeleted) {
        await handleDeleteSession(session.id);
        return;
    }
    if (wasInTrash && !session.isDeleted) {
        setDeletedSessions(prev => prev.filter(s => s.id !== session.id));
        setSessions(prev => [...prev, session]);
        await sessionService.restoreSession(session.id);
        setIsBookingModalOpen(false);
        return;
    }

    const isEdit = sessions.some(s => s.id === session.id);
    setSessions(prev => {
      if (isEdit) return prev.map(s => s.id === session.id ? session : s);
      return [...prev, session];
    });

    try {
      if (isEdit) await sessionService.updateSession(session);
      else await sessionService.createSession(session);
      const freshData = await sessionService.fetchSessions();
      setSessions(freshData);
    } catch (error) {
      console.error(error);
    }
    setIsBookingModalOpen(false);
  };

  const handleDeleteSession = async (id: string) => {
    const sessionToDelete = sessions.find(s => s.id === id);
    if (sessionToDelete) {
        setSessions(prev => prev.filter(s => s.id !== id));
        setDeletedSessions(prev => [...prev, { ...sessionToDelete, isDeleted: true }]);
    }
    if (activeTab === 'details' && selectedSessionId === id) {
      setActiveTab('calendar');
      setSelectedSessionId(null);
    }
    try {
      await sessionService.deleteSession(id);
    } catch (error) {
      console.error(error);
    }
  };

  // --- Lead Handlers ---
  
  const handleOpenAddLead = () => {
    setEditingLead(null);
    setIsLeadModalOpen(true);
  };

  const handleOpenEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setIsLeadModalOpen(true);
  };

  const handleSaveLead = async (formData: any) => {
    // If editing existing
    if (editingLead) {
        const updatedLead = { ...formData, id: editingLead.id, createdAt: editingLead.createdAt };
        setLeads(prev => prev.map(l => l.id === editingLead.id ? updatedLead : l));
        try {
            await leadService.updateLead(updatedLead);
        } catch(error) { console.error(error); }
    } else {
        // Creating new
        const tempId = crypto.randomUUID();
        const optimisticLead = { ...formData, id: tempId, createdAt: new Date().toISOString() };
        setLeads(prev => [optimisticLead, ...prev]);
        try {
            const newLead = await leadService.createLead(formData);
            setLeads(prev => prev.map(l => l.id === tempId ? newLead : l));
        } catch(error) {
            console.error(error);
            setLeads(prev => prev.filter(l => l.id !== tempId));
        }
    }
    setIsLeadModalOpen(false);
    setEditingLead(null);
  };

  const handleDeleteLead = async (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
    if (activeTab === 'lead-details' && selectedLeadId === id) {
      setActiveTab('leads');
      setSelectedLeadId(null);
    }
    try {
      await leadService.deleteLead(id);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSessionClick = (id: string) => {
    setSelectedSessionId(id);
    setActiveTab('details');
  };

  const handleLeadClick = (id: string) => {
    setSelectedLeadId(id);
    setActiveTab('lead-details');
  };

  const getHeaderTitle = () => {
    switch(activeTab) {
      case 'dashboard': return null;
      case 'calendar': return 'Booking Grid';
      case 'sessions': return 'Client List';
      case 'leads': return 'Lead Management';
      case 'followups': return 'Activity Center';
      case 'trash': return 'Deleted';
      case 'details': return 'Viewing Client';
      case 'lead-details': return 'Viewing Lead';
      default: return 'Clarity';
    }
  };

  const selectedSession = sessions.find(s => s.id === selectedSessionId) || deletedSessions.find(s => s.id === selectedSessionId);
  const selectedLead = leads.find(l => l.id === selectedLeadId);
  const nextSerialId = (sessions.length + deletedSessions.length + 1).toString().padStart(3, '0');
  const pageTitle = getHeaderTitle();

  const renderContent = () => {
    if (!userSession && !authLoading) return <Auth onLogin={() => setUserSession({ user: { email: 'test@test.com' } })} />;
    if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 text-red-600 animate-spin" /></div>;

    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <ClarityIcon className="w-6 h-6 text-red-600" />
            <span className="font-bold text-lg text-slate-800">Clarity</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
            {isMobileMenuOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
          </button>
        </div>

        <nav className={`fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 flex flex-col z-40 transition-transform duration-300 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
          <div className="p-6 flex items-center gap-3 border-b border-slate-100 h-20">
            <ClarityIcon className="w-8 h-8 text-red-600 shrink-0" />
            <span className="font-bold text-xl text-slate-800">Clarity</span>
          </div>
          <div className="p-4 space-y-2 mt-4 flex-1 overflow-y-auto">
            {[
              { id: 'calendar', icon: Calendar, label: 'Calendar' },
              { id: 'sessions', icon: Users, label: 'Sessions' },
              { id: 'leads', icon: UserPlus, label: 'Leads' },
              { id: 'followups', icon: Heart, label: 'Follow-ups' },
              { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
              { id: 'trash', icon: Trash2, label: 'Trash' },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium ${
                  activeTab === tab.id ? 'bg-red-50 text-red-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
          <div className="p-4 border-t border-slate-100">
            <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-red-600"><LogOut className="w-5 h-5" /><span>Sign Out</span></button>
          </div>
        </nav>

        <main className="md:ml-64 p-4 md:p-8 min-h-screen transition-all">
          {pageTitle && (
              <header className="hidden md:flex justify-between items-center mb-8 h-12">
                <h1 className="text-2xl font-bold text-slate-800">{pageTitle}</h1>
                {isLoading && <div className="flex items-center gap-2 text-slate-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" />Syncing...</div>}
              </header>
          )}

          <div className="animate-in fade-in duration-500">
            {isLoading && sessions.length === 0 ? (
              <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400 gap-4"><Loader2 className="w-8 h-8 animate-spin text-red-600" /><p>Loading data...</p></div>
            ) : (
              <>
                  {activeTab === 'dashboard' && <Dashboard sessions={sessions} onSessionClick={handleSessionClick} />}
                  {activeTab === 'calendar' && <CalendarView sessions={sessions} onSaveSession={handleSaveSession} onDeleteSession={handleDeleteSession} onSessionClick={handleSessionClick} onNewBooking={handleOpenNewBooking} onEditBooking={handleOpenEditBooking} />}
                  {activeTab === 'sessions' && <SessionsList sessions={sessions} onSessionClick={handleSessionClick} />}
                  
                  {activeTab === 'leads' && <LeadsView leads={leads} onAddClick={handleOpenAddLead} onEditClick={handleOpenEditLead} onDeleteLead={handleDeleteLead} onLeadClick={handleLeadClick} />}
                  
                  {activeTab === 'followups' && <FollowUps sessions={sessions} leads={leads} onSessionClick={handleSessionClick} onLeadClick={handleLeadClick} />}
                  
                  {activeTab === 'trash' && <SessionsList sessions={deletedSessions} onSessionClick={handleSessionClick} isTrashView={true} />}
                  
                  {activeTab === 'details' && selectedSession && <SessionDetailView session={selectedSession} onBack={() => setActiveTab(selectedSession.isDeleted ? 'trash' : 'calendar')} onUpdateSession={handleSaveSession} onEditSession={handleOpenEditBooking} />}
                  
                  {activeTab === 'lead-details' && selectedLead && <LeadDetailView lead={selectedLead} onBack={() => setActiveTab('leads')} onEditLead={handleOpenEditLead} onDeleteLead={handleDeleteLead} />}
              </>
            )}
          </div>
        </main>

        {isBookingModalOpen && (
          <BookingForm date={newBookingDate} initialSlotId={newBookingSlot} existingSession={editingSession} suggestedClientNumber={nextSerialId} onSave={handleSaveSession} onClose={() => setIsBookingModalOpen(false)} />
        )}

        <LeadFormModal 
          isOpen={isLeadModalOpen}
          onClose={() => setIsLeadModalOpen(false)}
          onSubmit={handleSaveLead}
          initialData={editingLead}
        />
      </div>
    );
  };

  return (
    <>
      {showSplash && (
        <div className={`fixed inset-0 bg-red-600 flex flex-col items-center justify-center z-[100] transition-opacity duration-700 ease-in-out ${isSplashFading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div className="flex flex-col items-center">
             <ClarityIcon className="w-24 h-24 text-white mb-6 animate-pulse" />
             <h1 className="text-4xl font-bold text-white tracking-tighter mb-2">Clarity</h1>
             <p className="text-white/80 text-sm font-medium tracking-widest uppercase">Demo</p>
          </div>
        </div>
      )}
      {renderContent()}
    </>
  );
};

export default App;
