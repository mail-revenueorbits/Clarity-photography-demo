
import React from 'react';
import { Session, Lead } from '../types';
import { Sparkles, Calendar, Heart, Phone, ArrowRight, UserPlus, StickyNote } from 'lucide-react';

interface FollowUpsProps {
  sessions: Session[];
  leads: Lead[];
  onSessionClick: (id: string) => void;
  onLeadClick: (id: string) => void;
}

const FollowUps: React.FC<FollowUpsProps> = ({ sessions, leads, onSessionClick, onLeadClick }) => {
  const today = new Date();
  today.setHours(0,0,0,0); // Normalise today for comparison
  
  // Logic to calculate Pasni: around 110 days (3 months 20 days)
  const calculatePasni = (birthday: string) => {
    const b = new Date(birthday);
    b.setMonth(b.getMonth() + 3);
    b.setDate(b.getDate() + 20);
    return b;
  };

  type MilestoneItem = {
    id: string; // For leads this will be 'l-UUID'
    rawId: string; // The actual UUID
    type: 'Birthday' | 'Pasni' | 'Lead Follow-up';
    date: Date;
    title: string;
    subtitle: string;
    note?: string;
    contact?: string;
    isLead: boolean;
    sessionId?: string;
  };

  const getCombinedMilestones = () => {
    const list: MilestoneItem[] = [];

    // 1. Process Sessions for Pasni/Birthday
    sessions.forEach(s => {
      if (!s.babyBirthday) return;
      const bDate = new Date(s.babyBirthday);
      
      // Birthday this year
      const bThisYear = new Date(today.getFullYear(), bDate.getMonth(), bDate.getDate());
      if (bThisYear >= today) {
        list.push({ 
          id: `b-${s.id}`,
          rawId: s.id,
          type: 'Birthday', 
          date: bThisYear, 
          title: `${s.clientName}'s Baby`, 
          subtitle: `Turning ${today.getFullYear() - bDate.getFullYear()}`,
          contact: s.clientPhone,
          isLead: false,
          sessionId: s.id
        });
      }

      // Pasni
      const pasniDate = calculatePasni(s.babyBirthday);
      if (pasniDate >= today) {
        list.push({ 
          id: `p-${s.id}`,
          rawId: s.id,
          type: 'Pasni', 
          date: pasniDate, 
          title: `${s.clientName}'s Baby`, 
          subtitle: 'Traditional Rice Feeding',
          contact: s.clientPhone,
          isLead: false,
          sessionId: s.id
        });
      }
    });

    // 2. Process Leads for Follow-ups
    leads.forEach(l => {
      if (l.isFollowUpRequired && l.followUpDate) {
        const fDate = new Date(l.followUpDate);
        list.push({
          id: `l-${l.id}`,
          rawId: l.id,
          type: 'Lead Follow-up',
          date: fDate,
          title: l.name,
          subtitle: l.source,
          note: l.note,
          contact: l.phone,
          isLead: true
        });
      }
    });

    return list.sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const milestones = getCombinedMilestones();

  const getIcon = (type: string) => {
    switch(type) {
      case 'Pasni': return <Sparkles className="w-7 h-7" />;
      case 'Birthday': return <Heart className="w-7 h-7" />;
      case 'Lead Follow-up': return <UserPlus className="w-7 h-7" />;
      default: return <Calendar className="w-7 h-7" />;
    }
  };

  const getColorClass = (type: string) => {
    switch(type) {
      case 'Pasni': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'Birthday': return 'bg-pink-50 text-pink-600 border-pink-200';
      case 'Lead Follow-up': return 'bg-blue-50 text-blue-600 border-blue-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const handleItemClick = (m: MilestoneItem) => {
    if (m.isLead) {
      onLeadClick(m.rawId);
    } else if (m.sessionId) {
      onSessionClick(m.sessionId);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm overflow-hidden relative">
         <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 opacity-50 blur-2xl"></div>
         <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-red-600" />
            Activity Center
         </h2>
         <p className="text-slate-500 mt-2">Upcoming baby milestones and lead follow-ups in one place.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {milestones.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
             <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
             <p className="text-slate-400 font-medium">No upcoming activities found.</p>
          </div>
        ) : (
          milestones.map((m) => (
            <div 
              key={m.id}
              onClick={() => handleItemClick(m)}
              className={`bg-white p-5 rounded-3xl border border-slate-100 hover:border-red-100 transition-all shadow-sm hover:shadow-md cursor-pointer group flex flex-col md:flex-row gap-5 items-start`}
            >
              <div className="flex items-start gap-4 flex-1">
                <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center ${getColorClass(m.type).split(' ')[0]} ${getColorClass(m.type).split(' ')[1]}`}>
                  {getIcon(m.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                     <h4 className="font-bold text-slate-800 text-lg group-hover:text-red-600 transition-colors">
                       {m.title}
                     </h4>
                     <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-widest ${getColorClass(m.type)}`}>
                       {m.type}
                     </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className={`font-medium ${m.date < today ? 'text-red-600 font-bold' : 'text-slate-700'}`}>
                      {m.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {m.date < today && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 rounded font-bold uppercase">Overdue</span>}
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500">{m.subtitle}</span>
                  </div>

                  {m.note && (
                    <div className="mt-3 flex items-start gap-2 bg-slate-50 p-3 rounded-lg text-sm text-slate-600 italic">
                      <StickyNote className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
                      {m.note}
                    </div>
                  )}
                  
                  <div className="mt-3 flex items-center justify-between">
                     <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                       <Phone className="w-3.5 h-3.5" />
                       {m.contact || 'No contact info'}
                     </div>
                     <div className="flex items-center gap-1 text-red-600 text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all">
                       View Details <ArrowRight className="w-3 h-3" />
                     </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FollowUps;
