import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, Receipt, Upload, Calculator, AlertTriangle } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../api/axiosConfig';
import { ENDPOINTS, EXPENSE_CATEGORIES } from '../api/endpoints';

const MAX_FILES = 5; // ต้องตรงกับ validate:"max=5" ฝั่ง backend (รองรับแค่ jpeg/png)

const emptyForm = () => ({
  title: '',
  category: EXPENSE_CATEGORIES[0],
  payeeId: '',
  incomeTypeCode: '',
  grossAmount: '',
  forceWithhold: false,
  overrideWht: false,
  whtRate: '',
  note: '',
  files: [],
});

const formatBaht = (n) => (n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// mount เฉพาะตอนเปิด (ดู AdminDisbursement) ฟอร์มจึงเริ่มว่างทุกครั้งอยู่แล้ว
const DisbursementModal = ({ onClose, onSaved, payees, incomeTypes }) => {
  const [form, setForm] = useState(emptyForm());
  const [preview, setPreview] = useState(null);
  const [previewError, setPreviewError] = useState('');

  const selectedPayee = useMemo(
    () => payees.find((p) => p.id === form.payeeId),
    [payees, form.payeeId]
  );

  // ประเภทเงินได้ที่เลือกได้ขึ้นกับว่าผู้รับเงินเป็นบุคคลธรรมดาหรือนิติบุคคล
  // (เงินได้ 40(1)-(4) ที่จ่ายบุคคลธรรมดาต้องยื่น ภ.ง.ด.1/2 ซึ่งระบบนี้ไม่รองรับ)
  const availableIncomeTypes = useMemo(() => {
    if (!selectedPayee) return [];
    return incomeTypes.filter((t) =>
      selectedPayee.type === 'individual' ? t.allowIndividual : t.allowJuristic
    );
  }, [incomeTypes, selectedPayee]);

  // ยิงคำนวณภาษีที่ backend เพื่อให้ตัวเลขที่โชว์ = ตัวเลขที่จะถูกบันทึกจริงเสมอ
  useEffect(() => {
    const amount = parseFloat(form.grossAmount);
    const isReady = Boolean(selectedPayee) && Boolean(form.incomeTypeCode) && amount > 0;

    const timer = setTimeout(async () => {
      if (!isReady) {
        setPreview(null);
        setPreviewError('');
        return;
      }

      try {
        const res = await api.post(ENDPOINTS.DISBURSEMENTS.PREVIEW_WHT, {
          payeeType: selectedPayee.type,
          incomeTypeCode: form.incomeTypeCode,
          grossAmount: amount,
          forceWithhold: form.forceWithhold,
          overrideWht: form.overrideWht,
          whtRate: form.overrideWht ? parseFloat(form.whtRate) || 0 : 0,
        });
        if (res.data.code !== '0000') {
          setPreview(null);
          setPreviewError(res.data.message);
          return;
        }
        setPreview(res.data.data);
        setPreviewError('');
      } catch (err) {
        setPreview(null);
        setPreviewError(err.response?.data?.message || 'คำนวณภาษีไม่สำเร็จ');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [selectedPayee, form.incomeTypeCode, form.grossAmount, form.forceWithhold, form.overrideWht, form.whtRate]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    const remaining = MAX_FILES - form.files.length;
    if (remaining <= 0) {
      Swal.fire({ title: `แนบได้สูงสุด ${MAX_FILES} ไฟล์`, icon: 'warning', confirmButtonText: 'รับทราบ' });
      e.target.value = '';
      return;
    }
    setForm((prev) => ({ ...prev, files: [...prev.files, ...selected.slice(0, remaining)] }));
    e.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    Swal.fire({ title: 'กำลังบันทึกรายการเบิกจ่าย...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      const data = new FormData();
      data.append('title', form.title);
      data.append('category', form.category);
      data.append('payeeId', form.payeeId);
      data.append('incomeTypeCode', form.incomeTypeCode);
      data.append('grossAmount', form.grossAmount);
      data.append('forceWithhold', String(form.forceWithhold));
      data.append('overrideWht', String(form.overrideWht));
      data.append('whtRate', form.overrideWht ? form.whtRate || '0' : '0');
      data.append('note', form.note);
      form.files.forEach((file) => data.append('files', file));

      const res = await api.post(ENDPOINTS.DISBURSEMENTS.CREATE, data);
      if (res.data.code !== '0000') {
        Swal.fire({ title: 'บันทึกไม่สำเร็จ', text: res.data.message, icon: 'warning', confirmButtonText: 'ตกลง' });
        return;
      }

      await Swal.fire({
        title: 'สำเร็จ',
        text: `สร้างใบเบิกจ่าย ${res.data.data.docNo} แล้ว รอการอนุมัติ`,
        icon: 'success',
        confirmButtonText: 'ตกลง',
      });
      onSaved();
      onClose();
    } catch (err) {
      Swal.fire({ title: 'เกิดข้อผิดพลาด', text: err.response?.data?.message || 'ไม่สามารถบันทึกรายการได้', icon: 'error', confirmButtonText: 'ตกลง' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[130] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden">
        <div className="bg-slate-800 p-5 text-white flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Receipt size={20} />
            <h3 className="font-bold">ตั้งเรื่องเบิกจ่าย</h3>
          </div>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">รายการที่เบิก</label>
            <input required className="w-full border border-slate-200 p-2.5 rounded-xl outline-none"
              placeholder="เช่น ค่าจ้างรักษาความปลอดภัย เดือนกรกฎาคม"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">หมวดรายจ่าย</label>
              <select className="w-full border border-slate-200 p-2.5 rounded-xl outline-none bg-white"
                value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">จำนวนเงินก่อนหักภาษี (บาท)</label>
              <input required type="number" min="0.01" step="0.01"
                className="w-full border border-slate-200 p-2.5 rounded-xl outline-none"
                value={form.grossAmount} onChange={(e) => setForm({ ...form, grossAmount: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">ผู้รับเงิน</label>
            <select required className="w-full border border-slate-200 p-2.5 rounded-xl outline-none bg-white"
              value={form.payeeId}
              onChange={(e) => setForm({ ...form, payeeId: e.target.value, incomeTypeCode: '' })}>
              <option value="">-- เลือกผู้รับเงิน --</option>
              {payees.filter((p) => p.active).map((p) => (
                <option key={p.id} value={p.id}>{p.displayName} ({p.typeLabel})</option>
              ))}
            </select>
            {selectedPayee && (
              <p className="text-xs text-slate-400 mt-1">
                เลขผู้เสียภาษี {selectedPayee.taxId} — ยื่นด้วย {selectedPayee.taxFormLabel}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">ประเภทเงินได้ (ตัวกำหนดอัตราภาษี)</label>
            <select required disabled={!selectedPayee}
              className="w-full border border-slate-200 p-2.5 rounded-xl outline-none bg-white disabled:bg-slate-100"
              value={form.incomeTypeCode} onChange={(e) => setForm({ ...form, incomeTypeCode: e.target.value })}>
              <option value="">{selectedPayee ? '-- เลือกประเภทเงินได้ --' : 'เลือกผู้รับเงินก่อน'}</option>
              {availableIncomeTypes.map((t) => (
                <option key={t.code} value={t.code}>{t.label} — มาตรา {t.section} ({t.rate}%)</option>
              ))}
            </select>
          </div>

          <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <label className="flex items-start gap-2 text-sm text-slate-600">
              <input type="checkbox" className="mt-1" checked={form.forceWithhold}
                onChange={(e) => setForm({ ...form, forceWithhold: e.target.checked })} />
              <span>บังคับหักภาษีแม้ยอดไม่ถึง 1,000 บาท <span className="text-slate-400">(ใช้กับสัญญาต่อเนื่องที่ยอดรวมทั้งสัญญาตั้งแต่ 1,000 บาทขึ้นไป)</span></span>
            </label>

            <label className="flex items-start gap-2 text-sm text-slate-600">
              <input type="checkbox" className="mt-1" checked={form.overrideWht}
                onChange={(e) => setForm({ ...form, overrideWht: e.target.checked })} />
              <span>ระบุอัตราภาษีเอง <span className="text-slate-400">(กรณีได้รับยกเว้น หรือมีอัตราเฉพาะตามกฎหมาย)</span></span>
            </label>

            {form.overrideWht && (
              <input type="number" min="0" max="100" step="0.01" placeholder="อัตราภาษี %"
                className="w-32 border border-slate-200 p-2 rounded-lg outline-none text-sm"
                value={form.whtRate} onChange={(e) => setForm({ ...form, whtRate: e.target.value })} />
            )}
          </div>

          {/* ผลคำนวณภาษี — ตัวเลขชุดนี้มาจาก backend ตัวเดียวกับที่จะบันทึกจริง */}
          {preview && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 space-y-1 text-sm">
              <div className="flex items-center gap-2 text-indigo-700 font-bold mb-2">
                <Calculator size={16} /> ผลคำนวณภาษีหัก ณ ที่จ่าย
              </div>
              <div className="flex justify-between"><span className="text-slate-500">ยอดก่อนหักภาษี</span><span>{formatBaht(preview.grossAmount)}</span></div>
              <div className="flex justify-between">
                <span className="text-slate-500">ภาษีหัก ณ ที่จ่าย ({preview.whtRate}%)</span>
                <span className="text-red-600">-{formatBaht(preview.whtAmount)}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-indigo-200 pt-1 mt-1">
                <span>จ่ายจริงให้ผู้รับเงิน</span><span>{formatBaht(preview.netAmount)}</span>
              </div>
              <p className="text-xs text-slate-500 pt-1">
                ยื่นด้วย {preview.taxFormLabel} — {preview.incomeTypeLabel} (มาตรา {preview.incomeSection})
              </p>
              {preview.exemptReason && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 mt-2">
                  {preview.exemptReason}
                </p>
              )}
            </div>
          )}

          {previewError && (
            <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-2xl p-3">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" /> {previewError}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">หมายเหตุ</label>
            <textarea rows={2} className="w-full border border-slate-200 p-2.5 rounded-xl outline-none"
              value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">เอกสารประกอบ (jpeg/png สูงสุด {MAX_FILES} ไฟล์)</label>
            <label className="flex items-center gap-2 border border-dashed border-slate-300 rounded-xl p-3 cursor-pointer text-slate-500 hover:bg-slate-50">
              <Upload size={18} /> เลือกไฟล์
              <input type="file" accept="image/jpeg,image/png" multiple className="hidden" onChange={handleFileChange} />
            </label>
            {form.files.length > 0 && (
              <ul className="text-xs text-slate-500 mt-2 space-y-1">
                {form.files.map((file, idx) => (
                  <li key={idx} className="flex justify-between items-center bg-slate-50 rounded-lg px-2 py-1">
                    <span className="truncate">{file.name}</span>
                    <button type="button" className="text-red-500"
                      onClick={() => setForm((prev) => ({ ...prev, files: prev.files.filter((_, i) => i !== idx) }))}>
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button type="submit" disabled={!preview}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:bg-slate-300">
            <Save size={18} /> บันทึกและส่งอนุมัติ
          </button>
        </form>
      </div>
    </div>
  );
};

export default DisbursementModal;
