import React, { useState } from 'react';
import { X, Save, UserPlus } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../api/axiosConfig';
import { ENDPOINTS, PAYEE_TYPES } from '../api/endpoints';

const emptyForm = () => ({
  type: 'juristic',
  taxId: '',
  branchNo: '00000',
  prefix: 'นาย',
  firstname: '',
  lastname: '',
  companyName: '',
  address: '',
  phone: '',
  bankName: '',
  bankAccountNo: '',
  bankAccountName: '',
  active: true,
});

// ตรวจ check digit เลขประจำตัวผู้เสียภาษี 13 หลัก (สูตรเดียวกับฝั่ง backend)
// ทำฝั่งนี้ด้วยเพื่อบอกผู้ใช้ทันทีตอนพิมพ์ ไม่ต้องรอ submit แล้วโดนตีกลับ
const isValidTaxId = (id) => {
  if (!/^\d{13}$/.test(id)) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += parseInt(id[i], 10) * (13 - i);
  return (11 - (sum % 11)) % 10 === parseInt(id[12], 10);
};

// component นี้ถูก mount เฉพาะตอนเปิด (ดู AdminPayee) จึงตั้งค่าเริ่มต้นของฟอร์ม
// จาก props ได้ตรง ๆ ไม่ต้องมี effect คอยรีเซ็ต
const PayeeModal = ({ onClose, onSaved, payee }) => {
  const [form, setForm] = useState(payee ? { ...emptyForm(), ...payee } : emptyForm());
  const isEdit = Boolean(payee);

  const taxIdTouched = form.taxId.length > 0;
  const taxIdValid = isValidTaxId(form.taxId);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!taxIdValid) {
      Swal.fire({ title: 'เลขประจำตัวผู้เสียภาษีไม่ถูกต้อง', text: 'ต้องเป็นตัวเลข 13 หลักและผ่านการตรวจ check digit', icon: 'warning', confirmButtonText: 'ตกลง' });
      return;
    }

    Swal.fire({ title: 'กำลังบันทึก...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      const payload = {
        type: form.type,
        taxId: form.taxId,
        branchNo: form.branchNo || '00000',
        prefix: form.type === 'individual' ? form.prefix : '',
        firstname: form.type === 'individual' ? form.firstname : '',
        lastname: form.type === 'individual' ? form.lastname : '',
        companyName: form.type === 'juristic' ? form.companyName : '',
        address: form.address,
        phone: form.phone,
        bankName: form.bankName,
        bankAccountNo: form.bankAccountNo,
        bankAccountName: form.bankAccountName,
        active: form.active,
      };

      const res = isEdit
        ? await api.put(ENDPOINTS.PAYEES.UPDATE(payee.id), payload)
        : await api.post(ENDPOINTS.PAYEES.CREATE, payload);

      // backend ตอบ business code แบบ HTTP 200 สำหรับกรณีข้อมูลไม่ผ่านเงื่อนไข
      if (res.data.code !== '0000') {
        Swal.fire({ title: 'บันทึกไม่สำเร็จ', text: res.data.message, icon: 'warning', confirmButtonText: 'ตกลง' });
        return;
      }

      await Swal.fire({ title: 'สำเร็จ', text: 'บันทึกข้อมูลผู้รับเงินเรียบร้อยแล้ว', icon: 'success', confirmButtonText: 'ตกลง' });
      onSaved();
      onClose();
    } catch (err) {
      Swal.fire({ title: 'เกิดข้อผิดพลาด', text: err.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลได้', icon: 'error', confirmButtonText: 'ตกลง' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[130] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="bg-slate-800 p-5 text-white flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <UserPlus size={20} />
            <h3 className="font-bold">{isEdit ? 'แก้ไขผู้รับเงิน' : 'เพิ่มผู้รับเงิน'}</h3>
          </div>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">ประเภทผู้รับเงิน</label>
            <select
              className="w-full border border-slate-200 p-2.5 rounded-xl outline-none bg-white"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              {PAYEE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">เลขประจำตัวผู้เสียภาษี (13 หลัก)</label>
            <input
              required
              inputMode="numeric"
              maxLength={13}
              className={`w-full border p-2.5 rounded-xl outline-none ${taxIdTouched && !taxIdValid ? 'border-red-400' : 'border-slate-200'}`}
              value={form.taxId}
              onChange={(e) => setForm({ ...form, taxId: e.target.value.replace(/\D/g, '') })}
            />
            {taxIdTouched && !taxIdValid && (
              <p className="text-xs text-red-500 mt-1">เลขไม่ถูกต้อง — กรมสรรพากรจะตีกลับตอนยื่นไฟล์ใบแนบ</p>
            )}
          </div>

          {form.type === 'individual' ? (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">คำนำหน้า</label>
                <select className="w-full border border-slate-200 p-2.5 rounded-xl outline-none bg-white"
                  value={form.prefix} onChange={(e) => setForm({ ...form, prefix: e.target.value })}>
                  {['นาย', 'นาง', 'นางสาว'].map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">ชื่อ</label>
                <input required className="w-full border border-slate-200 p-2.5 rounded-xl outline-none"
                  value={form.firstname} onChange={(e) => setForm({ ...form, firstname: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">นามสกุล</label>
                <input required className="w-full border border-slate-200 p-2.5 rounded-xl outline-none"
                  value={form.lastname} onChange={(e) => setForm({ ...form, lastname: e.target.value })} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-3">
                <label className="block text-sm font-bold text-slate-700 mb-1">ชื่อนิติบุคคล (ตามหนังสือรับรอง)</label>
                <input required className="w-full border border-slate-200 p-2.5 rounded-xl outline-none"
                  value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">เลขที่สาขา</label>
                <input maxLength={5} className="w-full border border-slate-200 p-2.5 rounded-xl outline-none"
                  value={form.branchNo} onChange={(e) => setForm({ ...form, branchNo: e.target.value.replace(/\D/g, '') })} />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">ที่อยู่ (ใช้พิมพ์ในใบแนบ/50 ทวิ)</label>
            <textarea required rows={2} className="w-full border border-slate-200 p-2.5 rounded-xl outline-none"
              value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">เบอร์โทร</label>
              <input className="w-full border border-slate-200 p-2.5 rounded-xl outline-none"
                value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">ธนาคาร</label>
              <input className="w-full border border-slate-200 p-2.5 rounded-xl outline-none"
                value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">เลขที่บัญชี</label>
              <input className="w-full border border-slate-200 p-2.5 rounded-xl outline-none"
                value={form.bankAccountNo} onChange={(e) => setForm({ ...form, bankAccountNo: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">ชื่อบัญชี</label>
              <input className="w-full border border-slate-200 p-2.5 rounded-xl outline-none"
                value={form.bankAccountName} onChange={(e) => setForm({ ...form, bankAccountName: e.target.value })} />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            เปิดใช้งาน (ตั้งเบิกให้ผู้รับเงินรายนี้ได้)
          </label>

          <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700">
            <Save size={18} /> บันทึก
          </button>
        </form>
      </div>
    </div>
  );
};

export default PayeeModal;
