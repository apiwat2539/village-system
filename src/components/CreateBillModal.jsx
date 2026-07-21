import React, { useState, useEffect } from 'react';
import { X, Receipt, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../api/axiosConfig';
import { ENDPOINTS } from '../api/endpoints';

const emptyForm = { houseNo: '', billingMonth: '', amount: '', dueDate: '', description: '' };

const CreateBillModal = ({ isOpen, onClose, defaultMonth, onCreated }) => {
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({ ...emptyForm, billingMonth: defaultMonth });
    }
  }, [isOpen, defaultMonth]);

  if (!isOpen) return null;

  const setField = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const isValid =
    form.houseNo.trim() &&
    form.billingMonth &&
    Number(form.amount) > 0 &&
    form.dueDate &&
    form.description.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await api.post(ENDPOINTS.BILLS.CREATE, {
        houseNo: form.houseNo.trim(),
        billingMonth: form.billingMonth,
        amount: Number(form.amount),
        dueDate: form.dueDate,
        description: form.description.trim(),
      });
      const billId = res.data.data?.id;

      onClose();
      onCreated?.();

      const result = await Swal.fire({
        title: 'สร้างบิลสำเร็จ',
        icon: 'success',
        confirmButtonText: 'ออกใบแจ้งหนี้',
        confirmButtonColor: '#059669',
        showCancelButton: true,
        cancelButtonText: 'ปิด',
      });
      if (result.isConfirmed && billId) {
        window.open(`/admin-invoice/${billId}`, '_blank');
      }
    } catch (err) {
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: err.response?.data?.message || 'ไม่สามารถสร้างบิลได้',
        icon: 'error',
        confirmButtonText: 'ตกลง',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl border border-emerald-100 bg-emerald-50/30 outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-sm text-slate-700 transition';
  const labelClass = 'block text-xs font-bold text-slate-500 mb-1.5';

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[110] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <Receipt size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white leading-tight">สร้างบิลรายหลัง</h3>
              <p className="text-xs text-emerald-100">ออกบิลเฉพาะหลังนอกรอบเดือนปกติ</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelClass}>บ้านเลขที่</label>
            <input
              className={inputClass}
              placeholder="เช่น 99/1"
              value={form.houseNo}
              onChange={setField('houseNo')}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>งวดบิล</label>
              <input
                type="month"
                className={inputClass}
                value={form.billingMonth}
                onChange={setField('billingMonth')}
                required
              />
            </div>
            <div>
              <label className={labelClass}>ครบกำหนดชำระ</label>
              <input
                type="date"
                className={inputClass}
                value={form.dueDate}
                onChange={setField('dueDate')}
                required
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>จำนวนเงิน (บาท)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className={inputClass}
              placeholder="เช่น 500"
              value={form.amount}
              onChange={setField('amount')}
              required
            />
          </div>

          <div>
            <label className={labelClass}>รายละเอียด</label>
            <input
              className={inputClass}
              placeholder="เช่น ค่าปรับพิเศษ, ค่าซ่อมส่วนกลาง"
              value={form.description}
              onChange={setField('description')}
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">ข้อความนี้จะแสดงเป็นรายการบนใบแจ้งหนี้</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl font-bold text-sm bg-slate-50 text-slate-500 hover:bg-slate-100 transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className={`flex-1 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg ${
                isValid && !isSubmitting
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
              }`}
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : 'สร้างบิล'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBillModal;
