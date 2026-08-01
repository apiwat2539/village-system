import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Landmark, Loader2, Download, FileSpreadsheet, CheckCircle2, AlertTriangle, CalendarClock } from 'lucide-react';
import api from '../api/axiosConfig';
import { ENDPOINTS } from '../api/endpoints';
import Swal from 'sweetalert2';

const formatBaht = (n) => (n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// งวดภาษีที่ต้องยื่น "ตอนนี้" คือเดือนก่อนหน้า (ยื่นภายในวันที่ 7 ของเดือนถัดจากเดือนที่จ่ายเงิน)
const previousMonth = () => {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 7);
};

const AdminTaxFiling = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [period, setPeriod] = useState(previousMonth());
  const [summary, setSummary] = useState(null);
  const [activeForm, setActiveForm] = useState('pnd3');
  const [detail, setDetail] = useState(null);
  const [history, setHistory] = useState([]);

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    try {
      const [summaryRes, historyRes] = await Promise.all([
        api.get(ENDPOINTS.TAX_FILINGS.SUMMARY(period)),
        api.get(ENDPOINTS.TAX_FILINGS.HISTORY),
      ]);
      setSummary(summaryRes.data.data);
      setHistory(Array.isArray(historyRes.data.data) ? historyRes.data.data : []);
    } catch (err) {
      console.error('Fetch tax filing summary error:', err);
      Swal.fire({ title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถดึงข้อมูลภาษีหัก ณ ที่จ่ายได้', icon: 'error', confirmButtonText: 'ตกลง' });
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  const fetchDetail = useCallback(async () => {
    try {
      const res = await api.get(ENDPOINTS.TAX_FILINGS.DETAIL(activeForm, period));
      setDetail(res.data.data);
    } catch (err) {
      console.error('Fetch tax filing detail error:', err);
      setDetail(null);
    }
  }, [activeForm, period]);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);
  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  // ดาวน์โหลดไฟล์ใบแนบ — backend ส่งไฟล์ดิบกลับมา (ไม่ห่อ envelope) ยกเว้นกรณี
  // ไม่มีรายการที่ต้องยื่น ซึ่งจะได้ envelope JSON กลับมาแทน จึงต้องแยกสองกรณี
  const handleDownload = async (formType, format) => {
    try {
      const res = await api.get(ENDPOINTS.TAX_FILINGS.EXPORT(formType, period, format), { responseType: 'blob' });

      if (res.data.type?.includes('application/json')) {
        const body = JSON.parse(await res.data.text());
        Swal.fire({ title: 'ดาวน์โหลดไม่สำเร็จ', text: body.message, icon: 'warning', confirmButtonText: 'ตกลง' });
        return;
      }

      const url = URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${formType}-${period}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      Swal.fire({ title: 'เกิดข้อผิดพลาด', text: err.response?.data?.message || 'ไม่สามารถดาวน์โหลดไฟล์ได้', icon: 'error', confirmButtonText: 'ตกลง' });
    }
  };

  const handleSubmitFiling = async (form) => {
    const { value: referenceNo, isConfirmed } = await Swal.fire({
      title: `บันทึกการยื่น ${form.formLabel}`,
      html: `<p class="text-sm text-slate-500">ยืนยันว่าได้อัปโหลดไฟล์ใบแนบผ่าน e-Filing ของกรมสรรพากรแล้ว<br/>รายการของงวดนี้จะถูกล็อกไม่ให้ยื่นซ้ำ</p>`,
      input: 'text',
      inputLabel: 'เลขอ้างอิงการยื่น / เลขที่ใบเสร็จรับชำระ (ถ้ามี)',
      showCancelButton: true,
      confirmButtonText: 'บันทึกการยื่น',
      cancelButtonText: 'ยกเลิก',
    });
    if (!isConfirmed) return;

    try {
      const res = await api.post(ENDPOINTS.TAX_FILINGS.SUBMIT, {
        formType: form.formType,
        period,
        referenceNo: referenceNo || '',
      });
      if (res.data.code !== '0000') {
        Swal.fire({ title: 'บันทึกไม่สำเร็จ', text: res.data.message, icon: 'warning', confirmButtonText: 'ตกลง' });
        return;
      }
      await Swal.fire({ title: 'บันทึกแล้ว', text: `บันทึกการยื่น ${form.formLabel} งวด ${period} เรียบร้อย`, icon: 'success', confirmButtonText: 'ตกลง' });
      fetchSummary();
      fetchDetail();
    } catch (err) {
      Swal.fire({ title: 'เกิดข้อผิดพลาด', text: err.response?.data?.message || 'ไม่สามารถบันทึกการยื่นได้', icon: 'error', confirmButtonText: 'ตกลง' });
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-kanit">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-wrap justify-between items-end gap-3">
              <div>
                <h2 className="text-2xl font-black text-slate-800 flex items-center">
                  <Landmark className="mr-3 text-indigo-600" size={28} /> ภาษีหัก ณ ที่จ่าย (นำส่งสรรพากร)
                </h2>
                <p className="text-sm text-slate-500">
                  สรุปยอดที่ต้องนำส่งรายเดือน พร้อมสร้างไฟล์ใบแนบ ภ.ง.ด.3/53 สำหรับอัปโหลดเข้า e-Filing
                </p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">งวด (เดือนที่จ่ายเงิน)</label>
                <input type="month" value={period} onChange={(e) => setPeriod(e.target.value)}
                  className="border border-slate-200 p-2.5 rounded-xl outline-none bg-white" />
              </div>
            </div>

            {isLoading || !summary ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 className="animate-spin mb-4" size={40} />
                <p>กำลังโหลดข้อมูล...</p>
              </div>
            ) : (
              <>
                {summary.warnings?.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-1">
                    <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                      <AlertTriangle size={18} /> ต้องแก้ก่อนยื่นจริง
                    </div>
                    <ul className="list-disc list-inside text-sm text-amber-700">
                      {summary.warnings.map((w, idx) => <li key={idx}>{w}</li>)}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {summary.forms.map((form) => (
                    <div key={form.formType} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-black text-slate-800">{form.formLabel}</h3>
                          <p className="text-xs text-slate-400">
                            {form.formType === 'pnd3' ? 'จ่ายให้บุคคลธรรมดา' : 'จ่ายให้นิติบุคคล'} · งวด {summary.periodLabel}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                          form.status === 'submitted' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {form.statusLabel}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 rounded-2xl p-3">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest">จำนวนราย</p>
                          <p className="font-black text-slate-800">{form.itemCount}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest">ยอดจ่ายรวม</p>
                          <p className="font-black text-slate-800">{formatBaht(form.totalPaid)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest">ภาษีนำส่ง</p>
                          <p className="font-black text-indigo-600">{formatBaht(form.totalTax)}</p>
                        </div>
                      </div>

                      <div className={`flex items-start gap-2 text-xs rounded-2xl p-3 ${
                        form.overdue ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-slate-50 text-slate-500'
                      }`}>
                        <CalendarClock size={16} className="mt-0.5 shrink-0" />
                        <div>
                          <p>กำหนดยื่นแบบกระดาษ: {form.dueDate} · ยื่นผ่านอินเทอร์เน็ต: {form.efilingDueDate}</p>
                          {form.status !== 'submitted' && form.itemCount > 0 && (
                            <p className="font-bold">
                              {form.overdue
                                ? `เลยกำหนดแล้ว — ประมาณการเงินเพิ่ม ${formatBaht(form.surchargeEstimate)} บาท (1.5%/เดือน)`
                                : `เหลืออีก ${form.daysLeft} วัน`}
                            </p>
                          )}
                          {form.status === 'submitted' && (
                            <p>ยื่นเมื่อ {form.submittedAt}{form.referenceNo ? ` · อ้างอิง ${form.referenceNo}` : ''}</p>
                          )}
                          {form.unfiledCount > 0 && (
                            <p className="text-red-600 font-bold">
                              มี {form.unfiledCount} รายการที่บันทึกจ่ายหลังจากยื่นแบบไปแล้ว — ต้องยื่นแบบเพิ่มเติมกับกรมสรรพากร
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => handleDownload(form.formType, 'txt')} disabled={form.itemCount === 0}
                          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400">
                          <Download size={16} /> ไฟล์ใบแนบ (.txt)
                        </button>
                        <button onClick={() => handleDownload(form.formType, 'csv')} disabled={form.itemCount === 0}
                          className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-200 disabled:text-slate-300">
                          <FileSpreadsheet size={16} /> ตรวจทาน (.csv)
                        </button>
                        {form.status !== 'submitted' && (
                          <button onClick={() => handleSubmitFiling(form)} disabled={form.itemCount === 0}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-700 disabled:bg-slate-200 disabled:text-slate-400">
                            <CheckCircle2 size={16} /> บันทึกการยื่น
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="flex p-4 gap-2 border-b border-slate-50">
                    {summary.forms.map((form) => (
                      <button key={form.formType} onClick={() => setActiveForm(form.formType)}
                        className={`px-4 py-2 rounded-xl font-bold text-sm transition ${
                          activeForm === form.formType ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400 hover:text-slate-600'
                        }`}>
                        รายการใบแนบ {form.formLabel}
                      </button>
                    ))}
                  </div>

                  {!detail || detail.items.length === 0 ? (
                    <p className="text-center text-slate-400 py-16">ไม่มีรายการที่ต้องยื่นในงวดนี้</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest">
                          <tr>
                            <th className="text-left py-3 px-4">ลำดับ</th>
                            <th className="text-left py-3 px-4">ผู้ถูกหักภาษี</th>
                            <th className="text-left py-3 px-4">ประเภทเงินได้</th>
                            <th className="text-center py-3 px-4">วันที่จ่าย</th>
                            <th className="text-right py-3 px-4">จำนวนเงิน</th>
                            <th className="text-right py-3 px-4">ภาษีที่หัก</th>
                            <th className="text-left py-3 px-4">เลขที่ 50 ทวิ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detail.items.map((item) => (
                            <tr key={item.disbursementId} className="border-t border-slate-50">
                              <td className="py-3 px-4 text-slate-400">{item.no}</td>
                              <td className="py-3 px-4">
                                <p className="text-slate-700">
                                  {item.payeePrefix}{item.payeeName} {item.payeeLastname}
                                </p>
                                <p className={`text-xs ${item.taxIdValid ? 'text-slate-400' : 'text-red-500 font-bold'}`}>
                                  {item.payeeTaxId}{item.taxIdValid ? '' : ' — เลขไม่ถูกต้อง'}
                                </p>
                              </td>
                              <td className="py-3 px-4 text-slate-600">
                                {item.incomeTypeLabel}
                                <span className="text-xs text-slate-400 block">มาตรา {item.incomeSection} · {item.whtRate}%</span>
                              </td>
                              <td className="py-3 px-4 text-center text-slate-600">{item.paymentDateBE}</td>
                              <td className="py-3 px-4 text-right">{formatBaht(item.grossAmount)}</td>
                              <td className="py-3 px-4 text-right font-bold text-indigo-600">{formatBaht(item.whtAmount)}</td>
                              <td className="py-3 px-4 text-slate-500 text-xs">{item.certificateNo || '—'}</td>
                            </tr>
                          ))}
                          <tr className="border-t-2 border-slate-200 font-bold bg-slate-50">
                            <td className="py-3 px-4" colSpan={4}>รวม {detail.items.length} รายการ</td>
                            <td className="py-3 px-4 text-right">{formatBaht(detail.summary.totalPaid)}</td>
                            <td className="py-3 px-4 text-right text-indigo-600">{formatBaht(detail.summary.totalTax)}</td>
                            <td />
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  <h3 className="font-bold text-slate-700 p-5 pb-3">ประวัติการนำส่ง</h3>
                  {history.length === 0 ? (
                    <p className="text-center text-slate-400 pb-10">ยังไม่มีประวัติการนำส่ง</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest">
                          <tr>
                            <th className="text-left py-3 px-4">แบบ</th>
                            <th className="text-left py-3 px-4">งวด</th>
                            <th className="text-right py-3 px-4">จำนวนราย</th>
                            <th className="text-right py-3 px-4">ภาษีนำส่ง</th>
                            <th className="text-left py-3 px-4">กำหนดยื่น</th>
                            <th className="text-left py-3 px-4">ยื่นเมื่อ</th>
                            <th className="text-left py-3 px-4">เลขอ้างอิง</th>
                          </tr>
                        </thead>
                        <tbody>
                          {history.map((row) => (
                            <tr key={row.id} className="border-t border-slate-50">
                              <td className="py-3 px-4 font-bold text-slate-700">{row.formLabel}</td>
                              <td className="py-3 px-4 text-slate-600">{row.periodLabel}</td>
                              <td className="py-3 px-4 text-right">{row.itemCount}</td>
                              <td className="py-3 px-4 text-right">{formatBaht(row.totalTax)}</td>
                              <td className="py-3 px-4 text-slate-500">{row.dueDate}</td>
                              <td className="py-3 px-4 text-slate-500">{row.submittedAt || '—'}</td>
                              <td className="py-3 px-4 text-slate-500">{row.referenceNo || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminTaxFiling;
