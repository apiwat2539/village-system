import React, { useState, useEffect } from 'react';
import {
  X, TrendingUp, TrendingDown, Calendar, Home, Tag, Receipt,
  CreditCard, User, Clock, Image as ImageIcon, Loader2
} from 'lucide-react';
import api from '../api/axiosConfig';
import { ENDPOINTS } from '../api/endpoints';

// ป้ายสถานะของรายการที่มาจากการแจ้งชำระของลูกบ้าน
// (รายการที่นิติบุคคลคีย์เองจะไม่มี status)
const STATUS_LABEL = {
  approved: { text: 'อนุมัติแล้ว', className: 'bg-green-100 text-green-700' },
  pending: { text: 'รอตรวจสอบ', className: 'bg-amber-100 text-amber-700' },
  rejected: { text: 'ปฏิเสธ', className: 'bg-red-100 text-red-700' },
};

const InfoBox = ({ icon, label, value }) => (
  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
      {icon} {label}
    </p>
    <p className="font-bold text-slate-800 break-words">{value || '-'}</p>
  </div>
);

const TransactionDetailModal = ({ isOpen, onClose, transactionId }) => {
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !transactionId) return;

    let cancelled = false;
    const fetchDetail = async () => {
      setIsLoading(true);
      setError('');
      setDetail(null);
      try {
        const response = await api.get(ENDPOINTS.TRANSACTIONS.GET_BY_ID(transactionId));
        if (!cancelled) setDetail(response.data.data);
      } catch (err) {
        console.error('Fetch transaction detail error:', err);
        if (!cancelled) setError('ไม่สามารถดึงรายละเอียดรายการได้');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchDetail();
    // กันเคสผู้ใช้กดสลับรายการเร็ว ๆ แล้ว response ของรายการเก่ามาทีหลัง
    return () => { cancelled = true; };
  }, [isOpen, transactionId]);

  if (!isOpen) return null;

  const isIncome = detail?.type === 'income';
  const status = STATUS_LABEL[detail?.status];
  const images = detail?.images || [];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className={`p-4 text-white flex justify-between items-center ${isIncome ? 'bg-green-600' : 'bg-indigo-600'}`}>
          <div className="flex items-center space-x-2">
            {isIncome ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            <h3 className="font-bold font-kanit text-lg">
              รายละเอียด{isIncome ? 'รายรับ' : 'รายการเบิกจ่าย'}
            </h3>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1 transition">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Loader2 className="animate-spin mb-3" size={36} />
              <p className="text-sm">กำลังโหลดรายละเอียด...</p>
            </div>
          )}

          {!isLoading && error && (
            <div className="py-16 text-center text-red-400 italic text-sm">{error}</div>
          )}

          {!isLoading && !error && detail && (
            <>
              {/* หัวเรื่อง + ยอดเงิน */}
              <div>
                <h4 className="text-lg font-bold text-slate-800 leading-tight">{detail.title}</h4>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-md font-bold">
                    <Tag size={11} /> {detail.category || 'ไม่ระบุหมวดหมู่'}
                  </span>
                  {status && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${status.className}`}>
                      {status.text}
                    </span>
                  )}
                </div>
                <p className={`text-3xl font-black mt-3 ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                  {isIncome ? '+' : '-'} ฿{detail.amount.toLocaleString()}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <InfoBox icon={<Calendar size={12} />} label="วันที่ทำรายการ" value={detail.date} />
                {detail.houseNo && <InfoBox icon={<Home size={12} />} label="บ้านเลขที่" value={detail.houseNo} />}
                {detail.paymentMethod && <InfoBox icon={<CreditCard size={12} />} label="ช่องทางชำระ" value={detail.paymentMethod} />}
                {detail.receiptNo && <InfoBox icon={<Receipt size={12} />} label="เลขที่ใบเสร็จ" value={detail.receiptNo} />}
              </div>

              <div className="space-y-1 text-xs text-slate-400">
                {detail.createdBy && (
                  <div className="flex items-center"><User size={13} className="mr-1.5" /> บันทึกโดย: {detail.createdBy}</div>
                )}
                {detail.createdAt && (
                  <div className="flex items-center"><Clock size={13} className="mr-1.5" /> บันทึกเมื่อ: {detail.createdAt}</div>
                )}
                {detail.receiptedAt && (
                  <div className="flex items-center"><Receipt size={13} className="mr-1.5" /> ออกใบเสร็จเมื่อ: {detail.receiptedAt}</div>
                )}
              </div>

              {/* สลิปของลูกบ้าน (private storage — signed url อายุสั้น) */}
              {detail.houseNo && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">หลักฐานการโอน (สลิป)</p>
                  {detail.slipUrl ? (
                    <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
                      <img
                        src={detail.slipUrl}
                        alt="สลิปการโอนเงิน"
                        className="w-full max-h-[420px] object-contain cursor-zoom-in hover:opacity-90 transition"
                        onClick={() => window.open(detail.slipUrl, '_blank')}
                      />
                    </div>
                  ) : (
                    <div className="text-sm text-slate-400 italic py-6 text-center bg-slate-50 rounded-2xl border border-slate-100">
                      ไม่มีรูปสลิปแนบมา
                    </div>
                  )}
                </div>
              )}

              {/* รูปแนบของรายการที่นิติบุคคลคีย์เอง */}
              {!detail.houseNo && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <ImageIcon size={12} /> เอกสาร/รูปแนบ
                  </p>
                  {images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {images.map((img, index) => (
                        <div
                          key={index}
                          className={`rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50 ${
                            images.length === 1 ? 'col-span-2' : 'col-span-1'
                          }`}
                        >
                          <img
                            src={img}
                            alt={`เอกสารแนบ ${index + 1}`}
                            className="w-full h-32 md:h-40 object-cover hover:scale-105 transition duration-500 cursor-zoom-in"
                            onClick={() => window.open(img, '_blank')}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-400 italic py-6 text-center bg-slate-50 rounded-2xl border border-slate-100">
                      ไม่มีเอกสารแนบ
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition shadow-sm active:scale-[0.98]"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailModal;
