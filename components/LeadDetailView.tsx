
import React, { useState, useRef, useEffect } from 'react';
import { Lead, LeadSource } from '../types';
import { ArrowLeft, Phone, Mail, Calendar, User, MoreVertical, Edit, Trash2, StickyNote, Megaphone, Clock } from 'lucide-react';

interface LeadDetailViewProps {
  lead: Lead;
  onBack: () => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (id: string) => void;
}

const LeadDetailView: React.FC<LeadDetailViewProps> = ({ lead, onBack, onEditLead, onDeleteLead }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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

  const handleDelete = () => {
    onDeleteLead(lead.id);
  };

  const getSourceColor = (src: string) => {
    switch (src) {
      case LeadSource.META: return 'bg-blue-50 text-blue-600 border-blue-200';
      case LeadSource.TIKTOK: return 'bg-pink-50 text-pink-600 border-pink-200';
      case LeadSource.GOOGLE: return 'bg-green-50 text-green-600 border-green-200';
      case LeadSource.WALK_IN: return 'bg-orange-50 text-orange-600 border-orange-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const isOverdue = lead.isFollowUpRequired && lead.followUpDate && lead.followUpDate < today;

  return (
    <div className="font-sans animate-in fade-in duration-300">
      {/* Navigation & Actions Header */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-red-600 transition-colors font-medium px-2 py-2 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
            <button 
              onClick={() => onEditLead(lead)}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors text-sm font-medium"
            >
              <Edit className="w-4 h-4" /> Edit
            </button>
            
            {/* Dropdown Menu */}
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
                        onEditLead(lead);
                     }}
                     className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 sm:hidden"
                   >
                     <Edit className="w-4 h-4" />
                     Edit Lead
                   </button>
                   <button 
                     onClick={() => {
                       setIsMenuOpen(false);
                       setShowDeleteModal(true);
                     }}
                     className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 border-t border-slate-50 sm:border-t-0"
                   >
                     <Trash2 className="w-4 h-4" />
                     Delete Lead
                   </button>
                </div>
              )}
            </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 p-8 text-white relative">
             <div className="flex flex-col md:flex-row justify-between items-start gap-6">
               <div>
                 <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border ${getSourceColor(lead.source)} bg-opacity-20 text-white border-white/20`}>
                   {lead.source} Lead
                 </span>
                 <h1 className="text-3xl font-bold">{lead.name}</h1>
                 <p className="text-slate-400 mt-2 text-sm flex items-center gap-2">
                   <Clock className="w-4 h-4" /> Added on {new Date(lead.createdAt).toLocaleDateString()}
                 </p>
               </div>

               {lead.isFollowUpRequired && lead.followUpDate && (
                  <div className={`px-5 py-3 rounded-2xl border ${isOverdue ? 'bg-red-500/20 border-red-500/50' : 'bg-emerald-500/20 border-emerald-500/50'}`}>
                    <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isOverdue ? 'text-red-400' : 'text-emerald-400'}`}>
                      {isOverdue ? 'Action Required' : 'Upcoming'}
                    </p>
                    <div className="flex items-center gap-2 font-bold text-lg">
                       <Calendar className="w-5 h-5" />
                       {new Date(lead.followUpDate).toLocaleDateString()}
                    </div>
                  </div>
               )}
             </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 shrink-0 border border-slate-100">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</p>
                <p className="font-semibold text-slate-800 text-lg mt-1">{lead.phone || 'Not provided'}</p>
                {lead.phone && (
                  <a href={`tel:${lead.phone}`} className="text-sm text-red-600 font-medium hover:underline mt-1 inline-block">Call Now</a>
                )}
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 shrink-0 border border-slate-100">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                <p className="font-semibold text-slate-800 text-lg mt-1 break-all">{lead.email || 'Not provided'}</p>
                 {lead.email && (
                  <a href={`mailto:${lead.email}`} className="text-sm text-red-600 font-medium hover:underline mt-1 inline-block">Send Email</a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
           <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
             <StickyNote className="w-5 h-5 text-red-600" />
             Notes & Requirements
           </h3>
           
           {lead.note ? (
             <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100 text-slate-700 leading-relaxed italic relative">
               <span className="text-4xl text-yellow-200 absolute top-2 left-2">"</span>
               <p className="relative z-10">{lead.note}</p>
             </div>
           ) : (
             <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
               <p>No notes added for this lead.</p>
             </div>
           )}
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
             <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
               <Trash2 className="w-6 h-6" />
             </div>
             <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Lead?</h3>
             <p className="text-slate-500 text-sm mb-6">Are you sure you want to remove this lead? This action cannot be undone.</p>
             
             <div className="flex gap-3">
               <button 
                 onClick={() => setShowDeleteModal(false)}
                 className="flex-1 px-4 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
               >
                 Cancel
               </button>
               <button 
                 onClick={handleDelete}
                 className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors shadow-sm shadow-red-200"
               >
                 Delete
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadDetailView;
