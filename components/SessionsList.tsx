
import React, { useState } from 'react';
import { Session } from '../types';
import { Search, Clock, Phone, CheckCircle, CircleDashed, Trash2 } from 'lucide-react';

interface SessionsListProps {
  sessions: Session[];
  onSessionClick: (id: string) => void;
  isTrashView?: boolean;
}

const SessionCard: React.FC<{ session: Session; onClick: () => void; isTrash: boolean }> = ({ session, onClick, isTrash }) => {
  // Parse date safely from YYYY-MM-DD string to avoid timezone issues
  const [year, month, day] = session.date.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const monthName = dateObj.toLocaleString('default', { month: 'short' });

  return (
    <div 
      onClick={onClick}
      className={`bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 hover:border-red-100 transition-all shadow-sm hover:shadow-md cursor-pointer group relative overflow-hidden mb-4 ${isTrash ? 'opacity-75' : ''}`}
    >
      {/* Selection/Hover indicator strip */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-red-500 transition-colors"></div>

      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        
        {/* Top/Left Section: Date + Info */}
        <div className="flex flex-row gap-4 items-start flex-1 min-w-0">
            {/* Date Box */}
            <div className="shrink-0 flex flex-col items-center justify-center bg-slate-50 rounded-2xl w-16 h-16 sm:w-20 sm:h-24 border border-slate-100">
                <span className="text-[10px] sm:text-xs font-bold text-red-600 uppercase tracking-wider">{monthName}</span>
                <span className="text-xl sm:text-3xl font-bold text-slate-800 leading-none my-0.5">{day}</span>
                <span className="text-[10px] text-slate-400 font-medium">{year}</span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
               <div className="flex flex-wrap items-center gap-2 mb-1">
                 <h4 className="font-bold text-base sm:text-lg text-slate-800 truncate group-hover:text-red-700 transition-colors">
                   {session.clientName}
                 </h4>
                 <span className="text-xs font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">#{session.clientNumber}</span>
                 {isTrash && <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0">Deleted</span>}
               </div>
               
               <p className="text-red-600 font-medium text-xs sm:text-sm mb-2">
                  {session.sessionType}
               </p>

               <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-slate-500">
                 <div className="flex items-center gap-1.5">
                   <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                   <span>{session.startTime} - {session.endTime}</span>
                 </div>
                 {session.clientPhone && (
                   <div className="flex items-center gap-1.5">
                     <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                     <span>{session.clientPhone}</span>
                   </div>
                 )}
               </div>
            </div>
        </div>

        {/* Bottom/Right Section: Status & Amount */}
        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-0 border-slate-50 pt-3 sm:pt-0 gap-1 sm:gap-2 w-full sm:w-auto pl-1">
           {/* Amount */}
           <div className="flex flex-col sm:items-end">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
             <span className="font-bold text-base sm:text-lg text-slate-900">NPR {(session.payment.totalAmount || 0).toLocaleString()}</span>
           </div>
           
           {/* Status */}
           <div>
             {session.payment.remainingPaid ? (
                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-100">
                  <CheckCircle className="w-3.5 h-3.5" /> 
                  <span>Paid</span>
                </div>
             ) : (
                <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-100">
                  <CircleDashed className="w-3.5 h-3.5" /> 
                  <span>Pending</span>
                </div>
             )}
           </div>
        </div>

      </div>
    </div>
  );
};

const SessionsList: React.FC<SessionsListProps> = ({ sessions, onSessionClick, isTrashView = false }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = sessions.filter(session => {
    const query = searchQuery.toLowerCase();
    const matchName = session.clientName.toLowerCase().includes(query);
    const matchPhone = session.clientPhone?.toLowerCase().includes(query);
    const matchNumber = session.clientNumber.toLowerCase().includes(query);
    return matchName || matchPhone || matchNumber;
  });

  // Generate today's date in local time YYYY-MM-DD
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;
  
  // Split into upcoming and past
  // Upcoming includes today and future dates
  const upcomingSessions = filteredSessions.filter(s => s.date >= todayStr);
  const pastSessions = filteredSessions.filter(s => s.date < todayStr);

  // Sort upcoming: Ascending (nearest first)
  upcomingSessions.sort((a, b) => {
    if (a.date === b.date) return a.startTime.localeCompare(b.startTime);
    return a.date.localeCompare(b.date);
  });

  // Sort past: Descending (most recent first)
  pastSessions.sort((a, b) => {
    if (a.date === b.date) return b.startTime.localeCompare(a.startTime);
    return b.date.localeCompare(a.date);
  });

  if (isTrashView && sessions.length === 0) {
    return (
       <div className="max-w-4xl mx-auto flex flex-col items-center justify-center h-[50vh] text-slate-400">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
             <Trash2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-600">Trash is Empty</h3>
          <p className="text-sm">No deleted sessions found.</p>
       </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Search Bar */}
      <div className="sticky top-0 bg-slate-50 pt-2 pb-6 z-10">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder={isTrashView ? "Search deleted sessions..." : "Search by Name, Phone Number, or ID..."} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all shadow-sm font-medium"
          />
        </div>
      </div>

      <div className="space-y-8 pb-20">
        {/* Upcoming Section */}
        {upcomingSessions.length > 0 && (
          <div>
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
               {isTrashView ? 'Future Dates' : 'Upcoming Sessions'}
               <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[10px]">{upcomingSessions.length}</span>
             </h3>
             {upcomingSessions.map(session => (
               <SessionCard 
                 key={session.id} 
                 session={session} 
                 onClick={() => onSessionClick(session.id)}
                 isTrash={isTrashView}
               />
             ))}
          </div>
        )}

        {/* Past Section */}
        {pastSessions.length > 0 && (
          <div>
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
               {isTrashView ? 'Past Dates' : 'Past Sessions'}
               <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[10px]">{pastSessions.length}</span>
             </h3>
             {pastSessions.map(session => (
               <SessionCard 
                 key={session.id} 
                 session={session} 
                 onClick={() => onSessionClick(session.id)}
                 isTrash={isTrashView}
               />
             ))}
          </div>
        )}

        {filteredSessions.length === 0 && (
           <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
             <p className="text-slate-400 text-sm">No sessions found matching your search.</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default SessionsList;
