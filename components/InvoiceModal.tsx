
import React, { useState } from 'react';
import { Session, PaymentType } from '../types';
import { X, Printer, Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';

interface InvoiceModalProps {
  session: Session;
  onClose: () => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ session, onClose }) => {
  const [downloading, setDownloading] = useState(false);

  // Logic: If remaining is paid, total paid is totalAmount (balance 0).
  // Otherwise, if split and deposit paid, total paid is deposit.
  // Otherwise 0.
  const totalPaid = session.payment.remainingPaid 
    ? (session.payment.totalAmount || 0)
    : (session.payment.type === PaymentType.SPLIT && session.payment.depositPaid ? (session.payment.depositAmount || 0) : 0);

  const remainingBalance = Math.max(0, (session.payment.totalAmount || 0) - totalPaid);

  const formatCurrency = (amount: number) => {
    return `NPR ${(amount || 0).toLocaleString()}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = async () => {
    setDownloading(true);
    try {
        const element = document.getElementById('invoice-content');
        if (element) {
            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: '#ffffff',
            });
            const data = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = data;
            link.download = `Invoice-${session.clientNumber}-${session.clientName.replace(/\s+/g, '_')}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    } catch (error) {
        console.error("Failed to generate image", error);
        alert("Failed to download invoice image.");
    } finally {
        setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:p-0 print:bg-white print:fixed print:inset-0">
      <style>{`
        @media print {
          @page { size: auto; margin: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          #invoice-content { transform: scale(0.95); transform-origin: top left; width: 105%; }
        }
      `}</style>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col print:shadow-none print:w-full print:h-full print:rounded-none print:max-w-none print:overflow-visible print:absolute print:inset-0">
        
        {/* Header - No Print */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100 print:hidden bg-white sticky top-0 z-10">
          <h2 className="text-lg font-bold text-slate-800">Invoice Preview</h2>
          <div className="flex gap-2">
            <button 
              onClick={handleDownloadImage}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span className="hidden sm:inline">Save Image</span>
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-colors text-sm font-medium"
            >
              <Printer className="w-4 h-4" /> 
              <span>Print</span>
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div id="invoice-content" className="p-8 md:p-12 print:p-8 bg-white h-full">
           <div className="flex justify-between items-start mb-10 print:mb-6">
             <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">INVOICE</h1>
                <p className="text-slate-400 mt-1 font-mono">#{session.clientNumber}</p>
             </div>
             <div className="text-right">
                <h3 className="font-bold text-xl text-red-600">Demo</h3>
                <p className="text-slate-500 text-sm mt-1 leading-relaxed">Kathmandu, Nepal</p>
             </div>
           </div>

           <div className="grid grid-cols-2 gap-8 mb-10 print:mb-6 bg-slate-50 p-6 rounded-2xl border border-slate-100 print:bg-transparent print:border-none print:p-0">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Billed To</h4>
                <p className="font-bold text-slate-900 text-lg">{session.clientName}</p>
                {session.clientEmail && (
                  <p className="text-slate-500 text-sm mt-1">{session.clientEmail}</p>
                )}
                {session.clientPhone && (
                  <p className="text-slate-500 text-sm mt-1">Phone: {session.clientPhone}</p>
                )}
                <p className="text-slate-500 text-sm mt-1">Source: {session.source}</p>
              </div>
              <div className="text-right">
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Invoice Date</h4>
                 <p className="font-medium text-slate-900">{session.date}</p>
                 <div className="mt-4">
                   <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Session Time</h4>
                   <p className="text-sm text-slate-700 font-medium">{session.startTime} - {session.endTime}</p>
                   <p className="text-sm text-slate-500 mt-1">{session.sessionType}</p>
                 </div>
              </div>
           </div>

           <table className="w-full mb-6 print:mb-4">
             <thead>
               <tr className="border-b-2 border-slate-100">
                 <th className="text-left py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                 <th className="text-right py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
               </tr>
             </thead>
             <tbody>
               <tr className="border-b border-slate-50">
                 <td className="py-4">
                   <p className="font-bold text-slate-800">{session.package}</p>
                   <p className="text-sm text-slate-500 mt-1">{session.deliverables}</p>
                 </td>
                 <td className="py-4 text-right font-bold text-slate-800">{formatCurrency(session.payment.totalAmount)}</td>
               </tr>
             </tbody>
           </table>

           <div className="flex justify-end mb-10 print:mb-6">
             <div className="w-full md:w-1/2 space-y-3">
               <div className="flex justify-between text-slate-600">
                 <span>Subtotal</span>
                 <span>{formatCurrency(session.payment.totalAmount)}</span>
               </div>
               
               {/* If remaining is NOT paid, but deposit IS paid (Split), show deposit */}
               {!session.payment.remainingPaid && session.payment.type === PaymentType.SPLIT && session.payment.depositPaid && (
                 <div className="flex justify-between text-emerald-600">
                   <span>Deposit Paid</span>
                   <span>- {formatCurrency(session.payment.depositAmount || 0)}</span>
                 </div>
               )}
               
               {/* If remaining IS paid, that means Full amount is paid */}
               {session.payment.remainingPaid && (
                 <div className="flex justify-between text-emerald-600">
                   <span>Paid Total</span>
                   <span>- {formatCurrency(session.payment.totalAmount)}</span>
                 </div>
               )}

               <div className="flex justify-between border-t-2 border-slate-100 pt-3 text-xl font-bold text-slate-900">
                 <span>Balance Due</span>
                 <span>{formatCurrency(remainingBalance)}</span>
               </div>
             </div>
           </div>

           {/* Simple Notes Section */}
           <div className="mt-8 border-t border-slate-100 pt-6 print:mt-4">
              <h4 className="text-sm font-bold text-slate-800 mb-2">Terms & Notes</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Thank you for choosing Demo. Please ensure any remaining balance is paid before the delivery of final photos. 
                {session.notes && <span className="block mt-2 font-medium text-slate-600">Note: {session.notes}</span>}
              </p>
           </div>
           
           <div className="mt-12 text-center print:mt-8">
             <p className="text-slate-400 text-xs">Generated by Clarity</p>
           </div>
        </div>

      </div>
    </div>
  );
};

export default InvoiceModal;
