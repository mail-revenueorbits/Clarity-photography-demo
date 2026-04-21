
import React, { useState } from 'react';
import { Session, STANDARD_SLOTS } from '../types';
import { 
  ChevronLeft, ChevronRight, CheckCircle, CircleDashed, 
  FileText, Calendar as CalendarIcon, Plus, Ban
} from 'lucide-react';
import InvoiceModal from './InvoiceModal';

interface CalendarViewProps {
  sessions: Session[];
  onSaveSession: (session: Session) => void;
  onDeleteSession: (id: string) => void;
  onSessionClick: (id: string) => void;
  onNewBooking: (date: string, slotId?: number) => void;
  onEditBooking: (session: Session) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ sessions, onSaveSession, onDeleteSession, onSessionClick, onNewBooking, onEditBooking }) => {
  const [currentDate, setCurrentDate] = useState(new Date()); // Tracks the month being viewed
  const [selectedDate, setSelectedDate] = useState(new Date()); // Tracks the selected day
  
  const [showInvoiceSession, setShowInvoiceSession] = useState<Session | undefined>(undefined);

  // Helper to format date as YYYY-MM-DD in LOCAL time
  const getLocalDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Calendar Logic
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay };
  };

  const { days, firstDay } = getDaysInMonth(currentDate);
  const daysArray = Array.from({ length: days }, (_, i) => i + 1);
  const paddingArray = Array.from({ length: firstDay }, (_, i) => i);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isSameDay = (d1: Date, d2: Date) => 
    d1.getFullYear() === d2.getFullYear() && 
    d1.getMonth() === d2.getMonth() && 
    d1.getDate() === d2.getDate();

  const getSessionCountForDay = (day: number) => {
    // Create date object for the specific day in the grid
    const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = getLocalDateKey(dateObj);
    return sessions.filter(s => s.date === dateStr).length;
  };

  // Selected Date Logic
  const selectedDateKey = getLocalDateKey(selectedDate);
  const daySessions = sessions.filter(s => s.date === selectedDateKey);
  
  // Track which sessions are displayed in standard slots to filter "other" sessions correctly
  const displayedSessionIds = new Set<string>();

  const getSessionForStandardSlot = (slotId: number) => {
    const slot = STANDARD_SLOTS.find(s => s.id === slotId);
    if (!slot) return undefined;
    // Find a session that matches the slot time and isn't marked as custom
    const session = daySessions.find(s => !s.isCustomSlot && s.startTime === slot.start);
    if (session) displayedSessionIds.add(session.id);
    return session;
  };

  const renderSessionCard = (session: Session) => (
      <div 
        onClick={() => onSessionClick(session.id)}
        className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 group hover:border-red-100 transition-all cursor-pointer hover:shadow-md h-full"
      >
        <div className="flex justify-between items-start mb-3">
          <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">
            {session.startTime} - {session.endTime}
            {session.isCustomSlot && <span className="ml-1 opacity-75">(Custom)</span>}
          </span>
          <div className="flex gap-1">
             <button 
               onClick={(e) => { e.stopPropagation(); setShowInvoiceSession(session); }} 
               className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
               title="View Invoice"
             >
               <FileText className="w-4 h-4" />
             </button>
             <button 
               onClick={(e) => { e.stopPropagation(); onEditBooking(session); }} 
               className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
               title="Edit Booking"
             >
               <CalendarIcon className="w-4 h-4" />
             </button>
          </div>
        </div>
        
        <div className="mb-3">
           <h4 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-red-600 transition-colors">{session.clientName}</h4>
           <p className="text-sm text-slate-500">{session.sessionType}</p>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
          <div className="flex items-center gap-1.5">
            {session.payment.remainingPaid ? (
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            ) : (
              <CircleDashed className="w-4 h-4 text-amber-500" />
            )}
            <span className={`text-xs font-medium ${session.payment.remainingPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
              {session.payment.remainingPaid ? 'Paid' : 'Pending'}
            </span>
          </div>
          <span className="font-semibold text-slate-700">
            NPR {(session.payment.totalAmount || 0).toLocaleString()}
          </span>
        </div>
      </div>
  );

  return (
    <div className="flex flex-col xl:flex-row gap-8">
      
      {/* Left: Calendar Grid */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b border-slate-50">
          <h2 className="text-xl font-bold text-slate-800">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-50 rounded-full text-slate-500 transition-colors">
              <ChevronLeft className="w-5 h-5"/>
            </button>
            <button onClick={handleNextMonth} className="p-2 hover:bg-slate-50 rounded-full text-slate-500 transition-colors">
              <ChevronRight className="w-5 h-5"/>
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="p-6">
          <div className="grid grid-cols-7 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {paddingArray.map(i => <div key={`pad-${i}`} />)}
            {daysArray.map(day => {
              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
              const isSelected = isSameDay(date, selectedDate);
              const isToday = isSameDay(date, new Date());
              const count = getSessionCountForDay(day);
              
              return (
                <button 
                  key={day}
                  onClick={() => setSelectedDate(date)}
                  className={`
                    h-14 sm:h-24 rounded-2xl flex flex-col items-start justify-between p-2 sm:p-3 transition-all border
                    ${isSelected 
                      ? 'bg-red-600 text-white shadow-lg shadow-red-200 border-red-600 scale-105 z-10' 
                      : 'bg-white text-slate-700 hover:border-red-200 border-transparent hover:bg-red-50/50'
                    }
                    ${isToday && !isSelected ? 'bg-slate-50 border-slate-200' : ''}
                  `}
                >
                  <span className={`text-sm font-semibold ${isToday && !isSelected ? 'text-red-600' : ''}`}>{day}</span>
                  
                  {count > 0 && (
                     <div className={`
                       text-[10px] sm:text-xs font-medium px-2 py-0.5 sm:py-1 rounded-md w-full truncate
                       ${isSelected ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'}
                     `}>
                       {count} {count === 1 ? 'Slot' : 'Slots'}
                     </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right: Slots for Selected Day */}
      <div className="w-full xl:w-[400px] shrink-0 space-y-6">
        <div className="flex items-center justify-between">
           <div>
             <h3 className="text-lg font-bold text-slate-800">
               {selectedDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric' })}
             </h3>
             <p className="text-slate-400 text-sm">
                {daySessions.length} Scheduled
             </p>
           </div>
           <button 
             onClick={() => onNewBooking(selectedDateKey)}
             className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors bg-red-600 hover:bg-red-700 text-white shadow-red-200"
           >
             <Plus className="w-5 h-5" />
           </button>
        </div>

        <div className="space-y-4">
          {STANDARD_SLOTS.map(slot => {
            const session = getSessionForStandardSlot(slot.id);
            return (
              <div key={slot.id} className="relative">
                {session ? (
                   // Booked Card
                   renderSessionCard(session)
                ) : (
                   // Empty Slot
                   <button 
                     onClick={() => onNewBooking(selectedDateKey, slot.id)}
                     className="w-full p-5 rounded-2xl border border-dashed flex items-center justify-between group transition-all duration-200 text-left border-slate-200 bg-transparent hover:border-red-400 hover:bg-red-50 hover:shadow-md hover:scale-[1.02] cursor-pointer"
                   >
                     <div>
                       <span className="block text-sm font-medium transition-colors text-slate-400 group-hover:text-red-600">
                         {slot.label}
                       </span>
                       <span className="block text-xs transition-colors text-slate-300 group-hover:text-red-500">
                         {slot.start} - {slot.end}
                       </span>
                     </div>
                     <div className="w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm bg-slate-50 text-slate-300 group-hover:bg-red-600 group-hover:text-white">
                       <Plus className="w-4 h-4" />
                     </div>
                   </button>
                )}
              </div>
            );
          })}

          {/* Other / Custom Bookings List */}
          {/* We filter sessions that haven't been displayed in the standard slots loop above */}
          {(() => {
             const otherSessions = daySessions.filter(s => !displayedSessionIds.has(s.id));
             if (otherSessions.length > 0) {
               return (
                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Other Bookings</h4>
                    <div className="space-y-4">
                      {otherSessions.map(session => (
                         <div key={session.id}>
                           {renderSessionCard(session)}
                         </div>
                      ))}
                    </div>
                  </div>
               );
             }
             return null;
          })()}
        </div>
      </div>

      {showInvoiceSession && (
        <InvoiceModal 
          session={showInvoiceSession}
          onClose={() => setShowInvoiceSession(undefined)}
        />
      )}

    </div>
  );
};

export default CalendarView;
