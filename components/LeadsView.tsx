
import React, { useState } from 'react';
import { Lead, LeadSource } from '../types';
import { Search, Phone, Mail, Calendar, Megaphone, UserPlus, Pencil, Trash2 } from 'lucide-react';

interface LeadsViewProps {
  leads: Lead[];
  onAddClick: () => void;
  onEditClick: (lead: Lead) => void;
  onDeleteLead: (id: string) => void;
  onLeadClick: (id: string) => void;
}

const LeadsView: React.FC<LeadsViewProps> = ({ leads, onAddClick, onEditClick, onDeleteLead, onLeadClick }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this lead?')) {
      onDeleteLead(id);
    }
  };

  const handleEditClick = (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation();
    onEditClick(lead);
  };

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.phone.includes(searchQuery) ||
    l.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSourceColor = (src: string) => {
    switch (src) {
      case LeadSource.META: return 'bg-blue-50 text-blue-600 border-blue-100';
      case LeadSource.TIKTOK: return 'bg-pink-50 text-pink-600 border-pink-100';
      case LeadSource.GOOGLE: return 'bg-green-50 text-green-600 border-green-100';
      case LeadSource.WALK_IN: return 'bg-orange-50 text-orange-600 border-orange-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
         <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
            />
         </div>
         <button 
           onClick={onAddClick}
           className="w-full md:w-auto px-6 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 shadow-sm shadow-red-200 transition-all flex items-center justify-center gap-2"
         >
           <UserPlus className="w-5 h-5" />
           Add New Lead
         </button>
      </div>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLeads.map(lead => (
          <div 
            key={lead.id} 
            onClick={() => onLeadClick(lead.id)}
            className="bg-white rounded-3xl border border-slate-100 p-6 hover:shadow-lg hover:border-red-100 transition-all group relative cursor-pointer"
          >
             <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${getSourceColor(lead.source)}`}>
                  {lead.source}
                </span>
                
                <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                   <button 
                     onClick={(e) => handleEditClick(e, lead)}
                     className="p-1.5 bg-slate-50 text-slate-500 hover:bg-slate-100 rounded-lg border border-slate-100"
                     title="Edit Lead"
                   >
                     <Pencil className="w-4 h-4" />
                   </button>
                   <button 
                     onClick={(e) => handleDeleteClick(e, lead.id)}
                     className="p-1.5 bg-slate-50 text-red-500 hover:bg-red-50 rounded-lg border border-slate-100"
                     title="Delete Lead"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
             </div>

             <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-red-600 transition-colors">{lead.name}</h3>
             
             <div className="space-y-2 mt-4 text-sm text-slate-500">
               {lead.phone && (
                 <div className="flex items-center gap-2">
                   <Phone className="w-4 h-4 text-slate-300" /> {lead.phone}
                 </div>
               )}
               {lead.email && (
                 <div className="flex items-center gap-2">
                   <Mail className="w-4 h-4 text-slate-300" /> <span className="truncate">{lead.email}</span>
                 </div>
               )}
             </div>

             {lead.note && (
               <div className="mt-4 bg-slate-50 p-3 rounded-xl text-sm text-slate-600 italic border border-slate-100">
                 "{lead.note}"
               </div>
             )}

             {lead.isFollowUpRequired && lead.followUpDate && (
               <div className="mt-4 flex items-center gap-2 text-xs font-medium bg-amber-50 text-amber-700 px-3 py-2 rounded-lg w-fit border border-amber-100">
                 <Calendar className="w-3.5 h-3.5" />
                 Follow up: {new Date(lead.followUpDate).toLocaleDateString()}
               </div>
             )}
          </div>
        ))}

        {filteredLeads.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
            <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No leads found. Start adding some!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadsView;
