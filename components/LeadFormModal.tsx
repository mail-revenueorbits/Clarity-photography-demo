
import React, { useState, useEffect } from 'react';
import { Lead, LeadSource } from '../types';
import { X, Save, Calendar } from 'lucide-react';

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (lead: any) => void;
  initialData?: Lead | null;
}

const LeadFormModal: React.FC<LeadFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [source, setSource] = useState<string>(LeadSource.META);
  const [note, setNote] = useState('');
  const [isFollowUpRequired, setIsFollowUpRequired] = useState(true);
  const [followUpDate, setFollowUpDate] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setPhone(initialData.phone);
      setEmail(initialData.email);
      setSource(initialData.source);
      setNote(initialData.note);
      setIsFollowUpRequired(initialData.isFollowUpRequired);
      setFollowUpDate(initialData.followUpDate || '');
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setSource(LeadSource.META);
    setNote('');
    setIsFollowUpRequired(true);
    setFollowUpDate('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert("Name is required");

    const formData = {
      ...(initialData || {}),
      name,
      phone,
      email,
      source,
      note,
      isFollowUpRequired,
      followUpDate: isFollowUpRequired ? followUpDate : undefined
    };

    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  const labelClass = "block text-sm font-medium text-slate-700 mb-1";
  const inputClass = "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors";

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
       <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
          <div className="flex justify-between items-center p-5 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">{initialData ? 'Edit Lead' : 'New Lead'}</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
             <div>
                <label className={labelClass}>Name <span className="text-red-500">*</span></label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Jane Doe" />
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Phone</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="98XXXXXXXX" />
                </div>
                <div>
                  <label className={labelClass}>Source</label>
                  <select value={source} onChange={(e) => setSource(e.target.value)} className={inputClass}>
                    {Object.values(LeadSource).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
             </div>

             <div>
                <label className={labelClass}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="client@example.com" />
             </div>

             <div>
                <label className={labelClass}>Note</label>
                <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} className={inputClass} placeholder="Interested in Newborn package..." />
             </div>

             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isFollowUpRequired} 
                    onChange={(e) => setIsFollowUpRequired(e.target.checked)} 
                    className="w-5 h-5 rounded text-red-600 focus:ring-red-500 border-slate-300" 
                  />
                  <span className="font-medium text-slate-700">Follow-up Required</span>
                </label>
                
                {isFollowUpRequired && (
                  <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                    <label className={labelClass}>Follow-up Date</label>
                    <input 
                      type="date" 
                      required={isFollowUpRequired}
                      value={followUpDate} 
                      onChange={(e) => setFollowUpDate(e.target.value)} 
                      className={inputClass} 
                    />
                  </div>
                )}
             </div>

             <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save Lead
                </button>
             </div>
          </form>
       </div>
    </div>
  );
};

export default LeadFormModal;
