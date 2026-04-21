
import React, { useState, useEffect } from 'react';
import { Session, PaymentType, ClientSource, STANDARD_SLOTS, SESSION_TYPE_OPTIONS, PACKAGE_PRESETS } from '../types';
import { X, Save, Calendar, User, Briefcase, DollarSign, FileText } from 'lucide-react';
import { adToBs, bsToAd } from '../services/nepaliDateService';

interface BookingFormProps {
  date: string;
  initialSlotId?: number;
  existingSession?: Session;
  suggestedClientNumber?: string;
  onSave: (session: Session) => void;
  onClose: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ date, initialSlotId, existingSession, suggestedClientNumber, onSave, onClose }) => {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  const [selectedSessionType, setSelectedSessionType] = useState(SESSION_TYPE_OPTIONS[0]);
  const [customSessionType, setCustomSessionType] = useState('');

  const [deliverables, setDeliverables] = useState(PACKAGE_PRESETS[0].deliverables);
  const [customPkg, setCustomPkg] = useState('');
  const [deliverableDueDate, setDeliverableDueDate] = useState('');
  const [deliverableOffset, setDeliverableOffset] = useState(7); // Default 7 days
  const [isDelivered, setIsDelivered] = useState(false);
  const [babyBirthday, setBabyBirthday] = useState('');

  const [source, setSource] = useState<ClientSource>(ClientSource.ADS);
  const [notes, setNotes] = useState('');
  const [pkg, setPkg] = useState(PACKAGE_PRESETS[0].name);
  const [paymentType, setPaymentType] = useState<PaymentType>(PaymentType.SPLIT);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [depositPaid, setDepositPaid] = useState(false);
  const [remainingPaid, setRemainingPaid] = useState(false);

  const [isCustomSlot, setIsCustomSlot] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Date Helpers
  const baseDateStr = existingSession ? existingSession.date : date;

  const addDays = (dateStr: string, days: number) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + days);

    const newY = dateObj.getFullYear();
    const newM = String(dateObj.getMonth() + 1).padStart(2, '0');
    const newD = String(dateObj.getDate()).padStart(2, '0');
    return `${newY}-${newM}-${newD}`;
  };

  const getDiffDays = (start: string, end: string) => {
    const [y1, m1, d1] = start.split('-').map(Number);
    const [y2, m2, d2] = end.split('-').map(Number);
    const date1 = new Date(y1, m1 - 1, d1);
    const date2 = new Date(y2, m2 - 1, d2);
    const diffTime = date2.getTime() - date1.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatDisplayDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  useEffect(() => {
    if (existingSession) {
      setClientName(existingSession.clientName);
      setClientEmail(existingSession.clientEmail || '');
      setClientPhone(existingSession.clientPhone || '');

      if (SESSION_TYPE_OPTIONS.includes(existingSession.sessionType)) {
        setSelectedSessionType(existingSession.sessionType);
        setCustomSessionType('');
      } else {
        setSelectedSessionType('Custom');
        setCustomSessionType(existingSession.sessionType);
      }

      setDeliverables(existingSession.deliverables);
      setDeliverableDueDate(existingSession.deliverableDueDate);

      // Calculate offset
      const diff = getDiffDays(existingSession.date, existingSession.deliverableDueDate);
      setDeliverableOffset(diff >= 0 ? diff : 7);

      setIsDelivered(existingSession.isDelivered);
      setBabyBirthday(existingSession.babyBirthday || '');
      setSource(existingSession.source);
      setNotes(existingSession.notes);
      // Detect if the stored package matches a preset
      const matchedPreset = PACKAGE_PRESETS.find(p => p.name === existingSession.package);
      if (matchedPreset) {
        setPkg(matchedPreset.name);
        setCustomPkg('');
      } else {
        setPkg('Custom');
        setCustomPkg(existingSession.package);
      }
      setPaymentType(existingSession.payment.type);
      setTotalAmount(existingSession.payment.totalAmount);
      setDepositAmount(existingSession.payment.depositAmount || 0);
      setDepositPaid(existingSession.payment.depositPaid);
      setRemainingPaid(existingSession.payment.remainingPaid);
      setIsCustomSlot(existingSession.isCustomSlot);
      setStartTime(existingSession.startTime);
      setEndTime(existingSession.endTime);
    } else {
      // Default deliverable due date: +7 days
      setDeliverableOffset(7);
      setDeliverableDueDate(addDays(date, 7));

      if (initialSlotId) {
        const slot = STANDARD_SLOTS.find(s => s.id === initialSlotId);
        if (slot) {
          setStartTime(slot.start);
          setEndTime(slot.end);
        }
      } else {
        setIsCustomSlot(true);
        setStartTime('10:00');
        setEndTime('11:00');
      }
    }
  }, [existingSession, initialSlotId, date]);

  const [convBsYear, setConvBsYear] = useState('');
  const [convBsMonth, setConvBsMonth] = useState('');
  const [convBsDay, setConvBsDay] = useState('');
  const [convResultAd, setConvResultAd] = useState('');
  const [showConverter, setShowConverter] = useState(false);

  const handleBsToAdConvert = () => {
    const y = parseInt(convBsYear);
    const m = parseInt(convBsMonth);
    const d = parseInt(convBsDay);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      const result = bsToAd(y, m, d);
      setConvResultAd(result);
    }
  };

  const handlePackageChange = (value: string) => {
    setPkg(value);
    if (value !== 'Custom') {
      const preset = PACKAGE_PRESETS.find(p => p.name === value);
      if (preset) {
        setDeliverables(preset.deliverables);
        if (preset.price) {
          setTotalAmount(preset.price);
        }
      }
      setCustomPkg('');
    }
  };

  const handleOffsetChange = (days: number) => {
    const safeDays = Math.max(0, days);
    setDeliverableOffset(safeDays);
    setDeliverableDueDate(addDays(baseDateStr, safeDays));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return alert("Client Name is required.");
    const finalSessionType = selectedSessionType === 'Custom' ? customSessionType.trim() : selectedSessionType;
    if (!finalSessionType) return alert("Please specify a session type.");

    const newSession: Session = {
      id: existingSession ? existingSession.id : crypto.randomUUID(),
      clientNumber: existingSession ? existingSession.clientNumber : (suggestedClientNumber || '001'),
      date: existingSession ? existingSession.date : date,
      startTime,
      endTime,
      isCustomSlot,
      clientName,
      clientEmail,
      clientPhone,
      sessionType: finalSessionType,
      deliverables,
      deliverableDueDate: deliverableDueDate || date,
      isDelivered,
      babyBirthday: babyBirthday || undefined,
      source,
      package: pkg === 'Custom' ? customPkg.trim() || 'Custom' : pkg,
      notes,
      payment: {
        type: paymentType,
        totalAmount,
        depositAmount: paymentType === PaymentType.SPLIT ? depositAmount : undefined,
        depositPaid: paymentType === PaymentType.SPLIT ? depositPaid : totalAmount > 0 && remainingPaid,
        remainingPaid,
      },
      createdAt: existingSession ? existingSession.createdAt : Date.now(),
    };
    onSave(newSession);
  };

  // Determine if baby birthday should be shown based on keywords in the selected type
  const currentTypeString = selectedSessionType === 'Custom' ? customSessionType : selectedSessionType;
  const showBabyFields = ['maternity', 'newborn', 'smash', 'birthday'].some(keyword =>
    currentTypeString.toLowerCase().includes(keyword)
  );

  const labelClass = "block text-sm font-medium text-slate-700 mb-1";
  const inputClass = "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors";

  // Filter packages based on session type
  const activePackages = PACKAGE_PRESETS.filter(p => p.sessionType === selectedSessionType);
  const showPackageSelector = activePackages.length > 0 || selectedSessionType === 'Custom';

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">{existingSession ? 'Update Session' : 'New Booking'}</h2>
            <p className="text-sm text-slate-500">ID: {existingSession ? existingSession.clientNumber : (suggestedClientNumber || '...')}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Client Info */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" /> Client Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={labelClass}>Client Name</label>
                <input type="text" required value={clientName} onChange={(e) => setClientName(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Phone Number</label>
                <input type="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email Address</label>
                <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Source</label>
                <select value={source} onChange={(e) => setSource(e.target.value as ClientSource)} className={inputClass}>
                  {Object.values(ClientSource).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Session Info */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-slate-400" /> Session Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Session Type</label>
                <select value={selectedSessionType} onChange={(e) => setSelectedSessionType(e.target.value)} className={inputClass}>
                  {SESSION_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  <option value="Custom">Custom...</option>
                </select>
              </div>
              {selectedSessionType === 'Custom' && (
                <div>
                  <label className={labelClass}>Custom Name</label>
                  <input type="text" value={customSessionType} onChange={(e) => setCustomSessionType(e.target.value)} className={inputClass} />
                </div>
              )}
              {showPackageSelector ? (
                <>
                  <div>
                    <label className={labelClass}>Package</label>
                    <select value={pkg} onChange={(e) => handlePackageChange(e.target.value)} className={inputClass}>
                      <option value="">Select a package...</option>
                      {activePackages.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                      <option value="Custom">Custom...</option>
                    </select>
                  </div>
                  {pkg === 'Custom' && (
                    <div>
                      <label className={labelClass}>Custom Package Name</label>
                      <input type="text" value={customPkg} onChange={(e) => setCustomPkg(e.target.value)} className={inputClass} placeholder="Enter package name" />
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <label className={labelClass}>Package Name</label>
                  <input type="text" value={pkg} onChange={(e) => setPkg(e.target.value)} className={inputClass} />
                </div>
              )}
              {showBabyFields && (
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Baby's Birthday (English/AD)</label>
                    <div className="space-y-2">
                      <input type="date" value={babyBirthday} onChange={(e) => setBabyBirthday(e.target.value)} className={inputClass} />
                      {babyBirthday && (
                        <div className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 flex items-center gap-2 w-fit">
                          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                          Nepali: {adToBs(babyBirthday)} BS
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <button 
                      type="button"
                      onClick={() => setShowConverter(!showConverter)}
                      className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2 hover:text-red-600 transition-colors"
                    >
                      {showConverter ? 'Hide' : 'Show'} Nepali to AD Converter
                    </button>
                    
                    {showConverter && (
                      <div className="mt-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase">Year (BS)</p>
                            <input type="number" placeholder="2081" value={convBsYear} onChange={(e) => setConvBsYear(e.target.value)} className={inputClass} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase">Month</p>
                            <input type="number" placeholder="1-12" value={convBsMonth} onChange={(e) => setConvBsMonth(e.target.value)} className={inputClass} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase">Day</p>
                            <input type="number" placeholder="1-32" value={convBsDay} onChange={(e) => setConvBsDay(e.target.value)} className={inputClass} />
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            type="button" 
                            onClick={handleBsToAdConvert}
                            className="bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-slate-900 transition-colors shrink-0"
                          >
                            Convert to AD
                          </button>
                          {convResultAd && (
                            <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-700 flex-1">
                              Result: <span className="text-red-600 font-mono">{convResultAd}</span>
                            </div>
                          )}
                        </div>
                        {convResultAd && convResultAd !== 'Invalid Year' && convResultAd !== 'Invalid Month' && convResultAd !== 'Invalid Day' && (
                          <button 
                            type="button"
                            onClick={() => {
                              setBabyBirthday(convResultAd);
                              setConvResultAd('');
                            }}
                            className="w-full text-[10px] font-bold text-emerald-600 bg-emerald-50 py-1.5 rounded-lg border border-emerald-100 uppercase hover:bg-emerald-100 transition-colors"
                          >
                            Use as Baby's Birthday
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">Time Slot</label>
                <label className="flex items-center gap-2 text-sm text-slate-500">
                  <input type="checkbox" checked={isCustomSlot} onChange={(e) => setIsCustomSlot(e.target.checked)} className="rounded text-red-600 focus:ring-red-500" />
                  Custom Time
                </label>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <input type="time" disabled={!isCustomSlot} value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputClass} />
                </div>
                <div className="flex items-center text-slate-400">-</div>
                <div className="flex-1">
                  <input type="time" disabled={!isCustomSlot} value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Deliverables */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" /> Deliverables
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <label className={labelClass}>Deadline</label>
                <div className="flex items-center gap-2 mb-2">
                  <button type="button" onClick={() => handleOffsetChange(3)} className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors font-medium">3 Days</button>
                  <button type="button" onClick={() => handleOffsetChange(7)} className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors font-medium">1 Week</button>
                  <button type="button" onClick={() => handleOffsetChange(14)} className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors font-medium">2 Weeks</button>
                  <button type="button" onClick={() => handleOffsetChange(30)} className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors font-medium">1 Month</button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative w-24 shrink-0">
                    <input
                      type="number"
                      min="0"
                      value={deliverableOffset}
                      onChange={(e) => handleOffsetChange(parseInt(e.target.value) || 0)}
                      className={`${inputClass} pr-8 font-bold text-center`}
                    />
                    <span className="absolute right-2 top-2 text-xs text-slate-400 font-medium pointer-events-none">d</span>
                  </div>
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 font-medium flex items-center justify-center">
                    {formatDisplayDate(deliverableDueDate)}
                  </div>
                </div>
              </div>
              <div className="flex items-end pb-3">
                <label className="flex items-center gap-3 text-sm font-medium text-slate-700 cursor-pointer bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-colors w-full">
                  <input type="checkbox" checked={isDelivered} onChange={(e) => setIsDelivered(e.target.checked)} className="rounded text-emerald-600 focus:ring-emerald-500 w-5 h-5" />
                  <div className="flex flex-col">
                    <span className="text-emerald-900">Mark as Delivered</span>
                    <span className="text-xs text-emerald-600 font-normal">Project completed</span>
                  </div>
                </label>
              </div>
            </div>
            <div>
              <label className={labelClass}>Items List</label>
              <textarea rows={8} value={deliverables} onChange={(e) => setDeliverables(e.target.value)} className={inputClass} placeholder="Photos, videos, prints..." />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Payment */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-slate-400" /> Payment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Total Amount (NPR)</label>
                <input type="number" required value={totalAmount === 0 ? '' : totalAmount} onChange={(e) => setTotalAmount(e.target.value ? parseFloat(e.target.value) : 0)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Payment Type</label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="radio" checked={paymentType === PaymentType.FULL} onChange={() => setPaymentType(PaymentType.FULL)} className="text-red-600 focus:ring-red-500" /> Full
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="radio" checked={paymentType === PaymentType.SPLIT} onChange={() => setPaymentType(PaymentType.SPLIT)} className="text-red-600 focus:ring-red-500" /> Split
                  </label>
                </div>
              </div>

              {paymentType === PaymentType.SPLIT && (
                <>
                  <div className="md:col-span-2 p-4 bg-amber-50 rounded-lg border border-amber-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Deposit Amount</label>
                      <input type="number" value={depositAmount === 0 ? '' : depositAmount} onChange={(e) => setDepositAmount(e.target.value ? parseFloat(e.target.value) : 0)} className={inputClass} />
                      <label className="flex items-center gap-2 mt-2 text-sm text-slate-700">
                        <input type="checkbox" checked={depositPaid} onChange={(e) => setDepositPaid(e.target.checked)} className="rounded text-emerald-600" />
                        Deposit Paid
                      </label>
                    </div>
                    <div>
                      <label className={labelClass}>Remaining Balance</label>
                      <div className="py-2 px-3 text-slate-500 bg-white border border-slate-200 rounded-lg text-sm">
                        NPR {(totalAmount - depositAmount).toLocaleString()}
                      </div>
                      <label className="flex items-center gap-2 mt-2 text-sm text-slate-700">
                        <input type="checkbox" checked={remainingPaid} onChange={(e) => setRemainingPaid(e.target.checked)} className="rounded text-emerald-600" />
                        Remaining Paid
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Notes */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" /> Additional Notes
            </h3>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={inputClass}
              placeholder="Any special requests or details..."
            />
          </div>

        </form>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-6 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Booking
          </button>
        </div>

      </div>
    </div>
  );
};

export default BookingForm;
