
import React, { useState, useMemo } from 'react';
import { Session, PaymentType } from '../types';
import { CheckCircle, AlertTriangle, TrendingUp, Users, CheckSquare, ChevronLeft, ChevronRight, ChevronDown, ListFilter } from 'lucide-react';

interface DashboardProps {
  sessions: Session[];
  onSessionClick: (id: string) => void;
}

type SortKey = 'urgency' | 'date' | 'amount' | 'payment';

const Dashboard: React.FC<DashboardProps> = ({ sessions, onSessionClick }) => {
  const [sortKey, setSortKey] = useState<SortKey>('urgency');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Navigation for Month
  const handlePrevMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1));
  };

  const currentMonthIdx = selectedMonth.getMonth();
  const currentYear = selectedMonth.getFullYear();
  
  const monthlySessions = sessions.filter(s => {
    const d = new Date(s.date);
    return d.getMonth() === currentMonthIdx && d.getFullYear() === currentYear;
  });

  const getUrgencyScore = (s: Session) => {
    if (s.isDelivered) return 0; // Green
    if (s.deliverableDueDate && s.deliverableDueDate < todayStr) return 3; // Red (Strictly Overdue)
    if (s.date < todayStr) return 2; // Yellow (Work in progress)
    return 1; // Neutral (Upcoming)
  };

  // Helper for Payment Sorting: 0 = Unpaid, 1 = Partial, 2 = Paid
  const getPaymentRank = (s: Session) => {
    if (s.payment.remainingPaid) return 2;
    if (s.payment.type === PaymentType.SPLIT && s.payment.depositPaid) return 1;
    return 0;
  };

  const formatFriendlyDate = (dateStr: string) => {
    if (!dateStr) return 'No date set';
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };

  const sortedSessions = useMemo(() => {
    return [...monthlySessions].sort((a, b) => {
      if (sortKey === 'urgency') {
        const scoreA = getUrgencyScore(a);
        const scoreB = getUrgencyScore(b);
        if (scoreA !== scoreB) return scoreB - scoreA;
        return a.date.localeCompare(b.date);
      }
      if (sortKey === 'date') return b.date.localeCompare(a.date);
      if (sortKey === 'amount') return b.payment.totalAmount - a.payment.totalAmount;
      if (sortKey === 'payment') {
        const rankA = getPaymentRank(a);
        const rankB = getPaymentRank(b);
        return rankA - rankB; 
      }
      return 0;
    });
  }, [monthlySessions, sortKey]);

  const totalRevenue = monthlySessions.reduce((acc, s) => acc + (s.payment.totalAmount || 0), 0);
  const totalBookings = monthlySessions.length;
  const deliveredSessions = monthlySessions.filter(s => s.isDelivered).length;

  const getPaymentDisplay = (s: Session) => {
    let paid = 0;
    if (s.payment.remainingPaid) {
      paid = s.payment.totalAmount || 0;
    } else if (s.payment.type === PaymentType.SPLIT && s.payment.depositPaid) {
      paid = s.payment.depositAmount || 0;
    }
    const isFull = paid >= (s.payment.totalAmount || 0);
    return {
      text: `NPR ${(paid || 0).toLocaleString()} / ${(s.payment.totalAmount || 0).toLocaleString()}`,
      isFull
    };
  };

  const StatCard = ({ label, value, icon: Icon, colorClass }: { label: string, value: string | number, icon: any, colorClass: string }) => (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
       <div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">{label}</p>
          <h3 className="text-xl font-semibold text-slate-800">{value}</h3>
       </div>
       <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass} bg-opacity-10`}>
          <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-')}`} />
       </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12">
      
      {/* Top Bar: Month Selector & Sort */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
          <div className="flex items-center gap-4 bg-white p-1.5 pr-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex gap-1">
              <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col">
               <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{selectedMonth.getFullYear()}</span>
               <span className="text-xl font-semibold text-slate-800 leading-none">{selectedMonth.toLocaleString('default', { month: 'long' })}</span>
            </div>
          </div>

          <div className="relative group min-w-[200px]">
             <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <ListFilter className="w-4 h-4 text-slate-400" />
             </div>
             <select 
                value={sortKey} 
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="appearance-none w-full bg-white border border-slate-200 text-slate-700 py-3 pl-10 pr-10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500 font-medium text-sm transition-all shadow-sm hover:border-slate-300 cursor-pointer"
             >
                <option value="urgency">Sort by Urgency</option>
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
                <option value="payment">Sort by Payment Status</option>
             </select>
             <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <ChevronDown className="w-4 h-4 text-slate-400" />
             </div>
          </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          label="Total Revenue" 
          value={`NPR ${(totalRevenue || 0).toLocaleString()}`} 
          icon={TrendingUp} 
          colorClass="bg-emerald-500 text-emerald-600" 
        />
        <StatCard 
          label="Total Sessions" 
          value={totalBookings} 
          icon={Users} 
          colorClass="bg-blue-500 text-blue-600" 
        />
        <StatCard 
          label="Delivered" 
          value={`${deliveredSessions} / ${totalBookings}`} 
          icon={CheckSquare} 
          colorClass="bg-purple-500 text-purple-600" 
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800 text-slate-200">
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider">Session Date</th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider">Client Name</th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider">Session Type</th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider">Payment</th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider">Due Date</th>
                <th className="px-8 py-4 text-xs font-medium uppercase tracking-wider text-center">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {sortedSessions.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-slate-400">No sessions found for this month.</td></tr>
              ) : (
                sortedSessions.map((session, idx) => {
                  const urgency = getUrgencyScore(session);
                  const pay = getPaymentDisplay(session);
                  const isEven = idx % 2 === 0;
                  
                  return (
                    <tr 
                      key={session.id} 
                      onClick={() => onSessionClick(session.id)}
                      className={`${isEven ? 'bg-white' : 'bg-slate-50'} border-b border-slate-100 last:border-0 hover:bg-slate-100 transition-colors cursor-pointer group`}
                    >
                      <td className="px-6 py-4">
                         <div className="font-semibold text-slate-800">{formatFriendlyDate(session.date)}</div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="font-medium text-slate-800 text-base group-hover:text-red-600 transition-colors">{session.clientName}</div>
                         <div className="text-xs text-slate-500 mt-0.5 font-normal">#{session.clientNumber}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-700 font-normal">{session.sessionType}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{session.package}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`font-medium ${pay.isFull ? 'text-emerald-600' : 'text-red-600'}`}>
                          {pay.text}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 font-normal">
                          {pay.isFull ? 'Settled' : 'Pending'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {session.isDelivered ? (
                           <div className="text-emerald-600 font-medium text-xs flex items-center gap-2">
                             <CheckCircle className="w-3.5 h-3.5" /> Delivered
                           </div>
                        ) : (
                           <div>
                             <div className={`font-medium flex items-center gap-2 ${urgency === 3 ? 'text-red-600' : 'text-slate-700'}`}>
                               {urgency === 3 && <AlertTriangle className="w-3.5 h-3.5" />}
                               {formatFriendlyDate(session.deliverableDueDate)}
                             </div>
                             <div className="text-xs text-slate-400 mt-0.5 font-normal">
                                {urgency === 3 ? 'Overdue' : urgency === 2 ? 'In Progress' : 'Upcoming'}
                             </div>
                           </div>
                        )}
                      </td>
                      <td className="px-8 py-4 text-center">
                         <span className={`
                            inline-block w-2.5 h-2.5 rounded-full
                            ${session.isDelivered ? 'bg-emerald-500' : urgency === 3 ? 'bg-red-500' : urgency === 2 ? 'bg-amber-400' : 'bg-slate-300'}
                         `}></span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
