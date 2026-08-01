import React, { useState } from 'react';
import { X, Banknote, Info } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../api/axiosConfig';
import { ENDPOINTS, PAYMENT_METHODS } from '../api/endpoints';

const formatBaht = (n) => (n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// บันทึกการจ่ายเงินจริง — วันที่จ่ายเป็นตัวกำหนดงวดภาษี จึงต้องเป็นวันที่โอน/จ่ายจริง
// ไม่ใช่วันที่มากดปุ่ม
// mount เฉพาะตอนเปิด (ดู AdminDisbursement) ค่าเริ่มต้นจึงคำนวณตอน mount ได้เลย
const PayDisbursementModal = ({ onClose, onSaved, disbursement }) => {
  const [form, setForm] = useState({
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: PAYMENT_METHODS[0],
    note: '',
  });

  const taxPeriod = form.paymentDate ? form.paymentDate.slice(0, 7) : '';

  const handleSubmit = async (e) => {
    e.preventDefault();

    Swal.fire({ title: 'กำลังบันทึกการจ่ายเงิน...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      const res = await api.post(ENDPOINTS.DISBURSEMENTS.PAY(disbursement.id), form);
      if (res.data.code !== '0000') {
        Swal.fire({ title: 'บันทึกไม่สำเร็จ', text: res.data.message, icon: 'warning', confirmButtonText: 'ตกลง' });
        return;
      }

      const certificateNo = res.data.data.certificateNo;
      await Swal.fire({
        title: 'บันทึกการจ่ายเงินแล้ว',
        text: certificateNo
          ? `ออกหนังสือรับรองการหักภาษี ณ ที่จ่ายเลขที่ ${certificateNo} และบันทึกรายจ่ายเข้าบัญชีหมู่บ้านแล้ว`
          : 'บันทึกรายจ่ายเข้าบัญชีหมู่บ้านแล้ว (รายการนี้ไม่มีการหักภาษี จึงไม่ต้องออก 50 ทวิ)',
        icon: 'success',
        confirmButtonText: 'ตกลง',
      });
      onSaved();
      onClose();
    } catch (err) {
      Swal.fire({ title: 'เกิดข้อผิดพลาด', text: err.response?.data?.message || 'ไม่สามารถบันทึกการจ่ายเงินได้', icon: 'error', confirmButtonText: 'ตกลง' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[130] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="bg-slate-800 p-5 text-white flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Banknote size={20} />
            <h3 className="font-bold">บันทึกการจ่ายเงิน</h3>
          </div>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 rounded-2xl p-4 text-sm space-y-1 border border-slate-100">
            <p className="font-bold text-slate-700">{disbursement.title}</p>
            <p className="text-slate-500">{disbursement.docNo} — {disbursement.payeeName}</p>
            <div className="flex justify-between pt-2"><span className="text-slate-500">ยอดก่อนหักภาษี</span><span>{formatBaht(disbursement.grossAmount)}</span></div>
            <div className="flex justify-between">
              <span className="text-slate-500">ภาษีหัก ณ ที่จ่าย ({disbursement.whtRate}%)</span>
              <span className="text-red-600">-{formatBaht(disbursement.whtAmount)}</span>
            </div>
            <div className="flex justify-between font-bold border-t border-slate-200 pt-1">
              <span>โอนให้ผู้รับเงิน</span><span>{formatBaht(disbursement.netAmount)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">วันที่จ่ายเงินจริง</label>
            <input required type="date" className="w-full border border-slate-200 p-2.5 rounded-xl outline-none"
              value={form.paymentDate} onChange={(e) => setForm({ ...form, paymentDate: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">วิธีจ่าย</label>
            <select className="w-full border border-slate-200 p-2.5 rounded-xl outline-none bg-white"
              value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
              {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">หมายเหตุ</label>
            <textarea rows={2} className="w-full border border-slate-200 p-2.5 rounded-xl outline-none"
              value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </div>

          {disbursement.whtAmount > 0 && (
            <div className="flex items-start gap-2 text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-2xl p-3">
              <Info size={16} className="mt-0.5 shrink-0" />
              <span>
                เมื่อบันทึกแล้วระบบจะออกหนังสือรับรองการหักภาษี ณ ที่จ่าย (50 ทวิ) ให้อัตโนมัติ
                และรวมรายการนี้ในแบบ {disbursement.taxFormLabel} งวด {taxPeriod}
                ซึ่งต้องนำส่งภายในวันที่ 7 ของเดือนถัดไป
              </span>
            </div>
          )}

          <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700">
            ยืนยันการจ่ายเงิน
          </button>
        </form>
      </div>
    </div>
  );
};

export default PayDisbursementModal;
