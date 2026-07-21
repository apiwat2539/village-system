import React from 'react';
import { X, Inbox, Clock, Home, Banknote, CheckCircle2, XCircle } from 'lucide-react';

const PendingPaymentDetailModal = ({ isOpen, onClose, data, onApprove, onReject }) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-amber-500 p-4 text-white flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Inbox size={20} />
            <h3 className="font-bold font-kanit text-lg">รายละเอียดการชำระเงิน</h3>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1 transition">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* ข้อมูลการชำระเงิน */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                <Home size={12} /> บ้านเลขที่
              </p>
              <p className="font-bold text-slate-800">{data.houseNo}</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                <Banknote size={12} /> จำนวนเงิน
              </p>
              <p className="font-bold text-slate-800">฿{data.amount.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center text-xs text-slate-400">
            <Clock size={13} className="mr-1.5" /> แจ้งชำระเมื่อ: {data.createdAt}
          </div>

          {/* สลิปการโอน */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">หลักฐานการโอน (สลิป)</p>
            {data.slipUrl ? (
              <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
                <img
                  src={data.slipUrl}
                  alt="สลิปการโอนเงิน"
                  className="w-full max-h-[420px] object-contain cursor-zoom-in hover:opacity-90 transition"
                  onClick={() => window.open(data.slipUrl, '_blank')}
                />
              </div>
            ) : (
              <div className="text-sm text-slate-400 italic py-6 text-center bg-slate-50 rounded-2xl border border-slate-100">
                ไม่มีรูปสลิปแนบมา
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button
            onClick={() => onReject(data.id)}
            className="flex-1 py-3 bg-white border border-red-200 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition shadow-sm active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <XCircle size={18} /> ปฏิเสธ
          </button>
          <button
            onClick={() => onApprove(data.id)}
            className="flex-1 py-3 bg-green-500 rounded-2xl font-bold text-white hover:bg-green-600 transition shadow-sm active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={18} /> อนุมัติ
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingPaymentDetailModal;
