
import React, { useState, useEffect, useRef } from 'react';
import { Session, PaymentType } from '../types';
import { 
  Calendar, Clock, Phone, User, FileText, DollarSign, 
  CheckCircle, CircleDashed, Briefcase, ArrowLeft, Trash2, Mail, MoreVertical, RefreshCw, Edit, Camera,
  Gift, CalendarCheck, AlertTriangle
} from 'lucide-react';
import InvoiceModal from './InvoiceModal';
import { adToBs } from '../services/nepaliDateService';

interface SessionDetailViewProps {
  session: Session;
  onBack: () => void;
  onUpdateSession: (session: Session) => void;
  onEditSession: (session: Session) => void;
}

const SessionDetailView: React.FC<SessionDetailViewProps> = ({ session, onBack, onUpdateSession, onEditSession }) => {
  const [showInvoice, setShowInvoice] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatCurrency = (amount: number) => `NPR ${(amount || 0).toLocaleString()}`;

  const formatFriendlyDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'Not set';
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Calculate Balance safely
  const totalPaid = session.payment.remainingPaid 
    ? (session.payment.totalAmount || 0)
    : (session.payment.type === PaymentType.SPLIT && session.payment.depositPaid ? (session.payment.depositAmount || 0) : 0);

  const remainingBalance = Math.max(0, (session.payment.totalAmount || 0) - totalPaid);

  const handleMarkAsPaid = () => {
    const updatedSession = {
        ...session,
        payment: {
            ...session.payment,
            remainingPaid: true,
            // Ensure deposit is also marked paid if it was a split payment, just for consistency
            depositPaid: session.payment.type === PaymentType.SPLIT ? true : session.payment.depositPaid
        }
    };
    onUpdateSession(updatedSession);
  };

  const handleDelete = () => {
    if (deleteConfirmation.toLowerCase() === 'delete') {
      const deletedSession = { ...session, isDeleted: true };
      onUpdateSession(deletedSession); 
      // Note: The parent App.tsx handles the actual API call and state removal
    }
  };

  const handleRestore = () => {
    const restoredSession = { ...session, isDeleted: false };
    onUpdateSession(restoredSession);
  };

  const isBabySession = (type: string) => {
    const lower = type.toLowerCase();
    return lower.includes('maternity') || lower.includes('newborn') || lower.includes('smash') || lower.includes('birthday');
  };

  return (
    <div className="font-sans animate-in fade-in duration-300">
      {/* Navigation & Actions Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-red-600 transition-colors font-medium px-2 py-2 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {session.isDeleted ? (
              // Actions for Deleted Session
              <button 
                onClick={handleRestore}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm text-sm font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Restore Session</span>
              </button>
            ) : (
              // Actions for Active Session
              <>
                {!session.payment.remainingPaid && (
                    <button 
                      onClick={handleMarkAsPaid}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm text-sm font-medium whitespace-nowrap"
                      title="Mark as Paid"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Mark as Paid</span>
                    </button>
                )}
                <button 
                  onClick={() => setShowInvoice(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-colors shadow-sm text-sm font-medium whitespace-nowrap"
                  title="Generate Invoice"
                >
                  <FileText className="w-4 h-4" />
                  <span>Invoice</span>
                </button>
                
                {/* Dropdown Menu for Secondary Actions */}
                <div className="relative" ref={menuRef}>
                  <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  
                  {isMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-20 overflow-hidden">
                       <button 
                         onClick={() => {
                            setIsMenuOpen(false);
                            onEditSession(session);
                         }}
                         className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                       >
                         <Edit className="w-4 h-4" />
                         Edit Details
                       </button>
                       <button 
                         onClick={() => {
                           setIsMenuOpen(false);
                           setShowDeleteModal(true);
                         }}
                         className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 border-t border-slate-50"
                       >
                         <Trash2 className="w-4 h-4" />
                         Delete Session
                       </button>
                    </div>
                  )}
                </div>
              </>
            )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Card */}
        <div className={`rounded-3xl shadow-sm border overflow-hidden ${session.isDeleted ? 'bg-slate-50 border-slate-200 grayscale' : 'bg-white border-slate-200'}`}>
          <div className="bg-slate-900 p-8 text-white relative">
             {session.isDeleted && (
               <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                 Deleted
               </div>
             )}
             <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
               <div>
                 <div className="inline-flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full text-xs font-mono text-slate-300 mb-4 border border-slate-700">
                   #{session.clientNumber}
                 </div>
                 <h1 className="text-3xl font-bold">{session.clientName}</h1>
                 <div className="flex items-center gap-2 mt-2 text-slate-400">
                    <User className="w-4 h-4" />
                    <span className="text-sm">{session.source} Client</span>
                 </div>
               </div>
               <div className="text-left sm:text-right w-full sm:w-auto">
                  {session.payment.remainingPaid ? (
                    <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full text-sm font-bold border border-emerald-500/30">
                      <CheckCircle className="w-4 h-4" /> Paid in Full
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-400 px-4 py-1.5 rounded-full text-sm font-bold border border-amber-500/30">
                      <CircleDashed className="w-4 h-4" /> Payment Pending
                    </div>
                  )}
                  <p className="mt-3 text-2xl font-bold">{formatCurrency(session.payment.totalAmount)}</p>
               </div>
             </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date</p>
                <p className="font-semibold text-slate-800 mt-0.5">{formatFriendlyDate(session.date)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Time</p>
                <p className="font-semibold text-slate-800 mt-0.5">{session.startTime} - {session.endTime}</p>
                {session.isCustomSlot && <span className="text-xs text-slate-500">(Custom Slot)</span>}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                <p className="font-semibold text-slate-800 mt-0.5">{session.clientPhone || 'No number'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</p>
                <p className="font-semibold text-slate-800 mt-0.5 break-all">{session.clientEmail || 'No email'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="md:col-span-2 space-y-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-red-600" />
                  Project Scope
                </h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Package</p>
                        <div className="inline-block bg-slate-100 px-4 py-2 rounded-xl text-slate-700 font-medium">
                          {session.package}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Session Type</p>
                        <div className="flex items-center gap-2 text-slate-700 font-medium bg-red-50 px-4 py-2 rounded-xl border border-red-100 w-fit">
                          <Camera className="w-4 h-4 text-red-500" />
                          {session.sessionType}
                        </div>
                      </div>

                      {/* Deliverables Due Date */}
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Deliverable Due Date</p>
                        <div className={`flex items-center gap-2 font-medium ${session.isDelivered ? 'text-emerald-600' : 'text-slate-700'}`}>
                            <CalendarCheck className="w-4 h-4" />
                            {formatFriendlyDate(session.deliverableDueDate)}
                            {session.isDelivered ? (
                              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase font-bold tracking-wide">Delivered</span>
                            ) : (
                              new Date(session.deliverableDueDate) < new Date() && (
                                <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full uppercase font-bold tracking-wide flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" /> Overdue
                                </span>
                              )
                            )}
                        </div>
                      </div>

                      {/* Baby Birthday (Conditional) - Shown if type matches, even if date is missing */}
                      {isBabySession(session.sessionType) && (
                        <div>
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Baby's Birthday</p>
                           <div className={`flex items-center gap-2 font-medium px-3 py-2 rounded-xl border w-fit ${session.babyBirthday ? 'bg-pink-50 border-pink-100 text-slate-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                              <Gift className={`w-4 h-4 ${session.babyBirthday ? 'text-pink-500' : 'text-slate-400'}`} />
                              {session.babyBirthday ? formatFriendlyDate(session.babyBirthday) : 'Not set'}
                           </div>
                        </div>
                      )}
                  </div>
                  
                  <hr className="border-slate-100" />

                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Deliverables List</p>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 whitespace-pre-line leading-relaxed">
                      {session.deliverables || 'No deliverables specified.'}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Notes</p>
                    <div className="bg-yellow-50/50 p-4 rounded-xl border border-yellow-100/50 text-slate-700 whitespace-pre-line leading-relaxed italic">
                      {session.notes || 'No additional notes provided.'}
                    </div>
                  </div>
                </div>
              </div>
           </div>

           <div className="space-y-6">
              {/* Financial Breakdown */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 h-full">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  Payment Details
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Type</span>
                    <span className="font-medium text-slate-800">{session.payment.type} Payment</span>
                  </div>
                  
                  <div className="border-t border-slate-50 my-4"></div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Total Amount</span>
                    <span className="font-medium text-slate-800">{formatCurrency(session.payment.totalAmount)}</span>
                  </div>

                  {session.payment.type === PaymentType.SPLIT && (
                     <>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Deposit</span>
                        <span className={`font-medium ${session.payment.depositPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                           {formatCurrency(session.payment.depositAmount || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Remaining</span>
                        <span className={`font-medium ${session.payment.remainingPaid ? 'text-emerald-600' : 'text-slate-800'}`}>
                           {formatCurrency((session.payment.totalAmount || 0) - (session.payment.depositAmount || 0))}
                        </span>
                      </div>
                     </>
                  )}

                  <div className="border-t border-slate-100 pt-4 mt-4">
                    <div className="flex justify-between items-center">
                       <span className="text-sm font-bold text-slate-800">Balance Due</span>
                       <span className={`text-lg font-bold ${remainingBalance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                         {formatCurrency(remainingBalance)}
                       </span>
                    </div>
                  </div>
                </div>
              </div>
           </div>
        </div>

      </div>
      
      {showInvoice && (
        <InvoiceModal 
          session={session} 
          onClose={() => setShowInvoice(false)} 
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Session?</h3>
              <p className="text-sm text-slate-500 mb-4">
                This will move the session to Trash. Type <span className="font-mono font-bold text-red-600">delete</span> to confirm.
              </p>
              
              <input 
                type="text" 
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Type 'delete'"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none mb-4"
              />
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={deleteConfirmation.toLowerCase() !== 'delete'}
                  className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionDetailView;
