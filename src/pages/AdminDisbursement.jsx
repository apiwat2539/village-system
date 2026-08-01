import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import DisbursementModal from '../components/DisbursementModal';
import PayDisbursementModal from '../components/PayDisbursementModal';
import { Receipt, Plus, Loader2, Check, X, Banknote, FileText, Clock, Wallet } from 'lucide-react';
import api from '../api/axiosConfig';
import { ENDPOINTS } from '../api/endpoints';
import Swal from 'sweetalert2';

const STATUS_TABS = [
  { key: '', label: 'ทั้งหมด' },
  { key: 'pending', label: 'รออนุมัติ' },
  { key: 'approved', label: 'รอจ่าย' },
  { key: 'paid', label: 'จ่ายแล้ว' },
  { key: 'rejected', label: 'ไม่อนุมัติ' },
];

const STATUS_STYLE = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const formatBaht = (n) => (n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const thisMonth = () => new Date().toISOString().slice(0, 7);

const AdminDisbursement = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [disbursements, setDisbursements] = useState([]);
  const [payees, setPayees] = useState([]);
  const [incomeTypes, setIncomeTypes] = useState([]);
  const [status, setStatus] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [payTarget, setPayTarget] = useState(null);

  const fetchAll = async (nextStatus = status) => {
    setIsLoading(true);
    try {
      const [listRes, payeeRes, typeRes] = await Promise.all([
        api.get(ENDPOINTS.DISBURSEMENTS.GET_ALL(nextStatus)),
        api.get(ENDPOINTS.PAYEES.GET_ALL),
        api.get(ENDPOINTS.DISBURSEMENTS.INCOME_TYPES),
      ]);
      setDisbursements(Array.isArray(listRes.data.data) ? listRes.data.data : []);
      setPayees(Array.isArray(payeeRes.data.data) ? payeeRes.data.data : []);
      setIncomeTypes(Array.isArray(typeRes.data.data) ? typeRes.data.data : []);
    } catch (err) {
      console.error('Fetch disbursements error:', err);
      Swal.fire({ title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถดึงข้อมูลรายการเบิกจ่ายได้', icon: 'error', confirmButtonText: 'ตกลง' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // การ์ดสรุปคิดจากรายการที่โหลดมาทั้งหมด จึงคำนวณตอน status = "" เท่านั้นถึงจะครบ
  const summary = useMemo(() => {
    const month = thisMonth();
    return disbursements.reduce(
      (acc, d) => {
        if (d.status === 'pending') acc.pendingCount += 1;
        if (d.status === 'approved') acc.awaitingPayment += d.netAmount;
        if (d.status === 'paid' && d.paymentDate?.slice(0, 7) === month) {
          acc.paidThisMonth += d.grossAmount;
          acc.taxThisMonth += d.whtAmount;
        }
        return acc;
      },
      { pendingCount: 0, awaitingPayment: 0, paidThisMonth: 0, taxThisMonth: 0 }
    );
  }, [disbursements]);

  const handleApprove = async (item) => {
    const confirm = await Swal.fire({
      title: 'อนุมัติรายการนี้?',
      text: `${item.docNo} — ${item.title}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'อนุมัติ',
      cancelButtonText: 'ยกเลิก',
    });
    if (!confirm.isConfirmed) return;

    try {
      const res = await api.post(ENDPOINTS.DISBURSEMENTS.APPROVE(item.id));
      if (res.data.code !== '0000') {
        Swal.fire({ title: 'ทำรายการไม่สำเร็จ', text: res.data.message, icon: 'warning', confirmButtonText: 'ตกลง' });
        return;
      }
      fetchAll();
    } catch (err) {
      Swal.fire({ title: 'เกิดข้อผิดพลาด', text: err.response?.data?.message || 'ไม่สามารถอนุมัติได้', icon: 'error', confirmButtonText: 'ตกลง' });
    }
  };

  const handleReject = async (item) => {
    const { value: reason, isConfirmed } = await Swal.fire({
      title: 'ไม่อนุมัติรายการนี้',
      input: 'text',
      inputLabel: 'เหตุผล',
      inputValidator: (v) => (!v ? 'กรุณาระบุเหตุผล' : undefined),
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
    });
    if (!isConfirmed) return;

    try {
      const res = await api.post(ENDPOINTS.DISBURSEMENTS.REJECT(item.id), { reason });
      if (res.data.code !== '0000') {
        Swal.fire({ title: 'ทำรายการไม่สำเร็จ', text: res.data.message, icon: 'warning', confirmButtonText: 'ตกลง' });
        return;
      }
      fetchAll();
    } catch (err) {
      Swal.fire({ title: 'เกิดข้อผิดพลาด', text: err.response?.data?.message || 'ไม่สามารถบันทึกได้', icon: 'error', confirmButtonText: 'ตกลง' });
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-kanit">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-3">
              <div>
                <h2 className="text-2xl font-black text-slate-800 flex items-center">
                  <Receipt className="mr-3 text-indigo-600" size={28} /> รายการเบิกจ่าย
                </h2>
                <p className="text-sm text-slate-500">ตั้งเบิก อนุมัติ จ่ายเงิน พร้อมคำนวณภาษีหัก ณ ที่จ่ายอัตโนมัติ</p>
              </div>
              <button onClick={() => setIsCreateOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-2xl font-bold hover:bg-indigo-700">
                <Plus size={18} /> ตั้งเรื่องเบิกจ่าย
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 text-amber-600 text-[10px] font-bold uppercase tracking-widest mb-2">
                  <Clock size={14} /> รออนุมัติ
                </div>
                <h3 className="text-2xl font-black text-slate-800">{summary.pendingCount} รายการ</h3>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 text-blue-600 text-[10px] font-bold uppercase tracking-widest mb-2">
                  <Wallet size={14} /> รอจ่าย (สุทธิ)
                </div>
                <h3 className="text-2xl font-black text-slate-800">฿{formatBaht(summary.awaitingPayment)}</h3>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 text-green-600 text-[10px] font-bold uppercase tracking-widest mb-2">
                  <Banknote size={14} /> จ่ายเดือนนี้
                </div>
                <h3 className="text-2xl font-black text-slate-800">฿{formatBaht(summary.paidThisMonth)}</h3>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 text-indigo-600 text-[10px] font-bold uppercase tracking-widest mb-2">
                  <FileText size={14} /> ภาษีหักเดือนนี้
                </div>
                <h3 className="text-2xl font-black text-slate-800">฿{formatBaht(summary.taxThisMonth)}</h3>
              </div>
            </div>

            <div className="flex flex-wrap p-1 bg-white rounded-2xl border border-slate-200 w-fit shadow-sm">
              {STATUS_TABS.map((tab) => (
                <button key={tab.key} onClick={() => setStatus(tab.key)}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition ${
                    status === tab.key ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
                  }`}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Loader2 className="animate-spin mb-4" size={40} />
                  <p>กำลังโหลดข้อมูล...</p>
                </div>
              ) : disbursements.length === 0 ? (
                <p className="text-center text-slate-400 py-16">ยังไม่มีรายการเบิกจ่าย</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest">
                      <tr>
                        <th className="text-left py-3 px-4">เลขที่ / รายการ</th>
                        <th className="text-left py-3 px-4">ผู้รับเงิน</th>
                        <th className="text-right py-3 px-4">ยอดจ่าย</th>
                        <th className="text-right py-3 px-4">ภาษีหัก</th>
                        <th className="text-right py-3 px-4">จ่ายสุทธิ</th>
                        <th className="text-center py-3 px-4">สถานะ</th>
                        <th className="text-right py-3 px-4">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {disbursements.map((item) => (
                        <tr key={item.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                          <td className="py-3 px-4">
                            <p className="font-bold text-slate-700">{item.title}</p>
                            <p className="text-xs text-slate-400">
                              {item.docNo} · {item.category} · {item.paymentDate || item.createdAt}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-slate-700">{item.payeeName}</p>
                            <p className="text-xs text-slate-400">
                              {item.incomeTypeLabel} · {item.taxFormLabel}
                            </p>
                          </td>
                          <td className="py-3 px-4 text-right">{formatBaht(item.grossAmount)}</td>
                          <td className="py-3 px-4 text-right text-red-600">
                            {item.whtAmount > 0 ? `-${formatBaht(item.whtAmount)}` : '—'}
                            {item.whtAmount > 0 && <span className="text-xs text-slate-400 block">{item.whtRate}%</span>}
                          </td>
                          <td className="py-3 px-4 text-right font-bold">{formatBaht(item.netAmount)}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${STATUS_STYLE[item.status] || 'bg-slate-100 text-slate-600'}`}>
                              {item.statusLabel}
                            </span>
                            {item.filed && <span className="block text-[10px] text-slate-400 mt-1">ยื่นภาษีแล้ว</span>}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-end gap-1">
                              {item.status === 'pending' && (
                                <>
                                  <button onClick={() => handleApprove(item)} title="อนุมัติ"
                                    className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100">
                                    <Check size={16} />
                                  </button>
                                  <button onClick={() => handleReject(item)} title="ไม่อนุมัติ"
                                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100">
                                    <X size={16} />
                                  </button>
                                </>
                              )}
                              {item.status === 'approved' && (
                                <button onClick={() => setPayTarget(item)}
                                  className="px-3 py-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-bold">
                                  บันทึกจ่าย
                                </button>
                              )}
                              {item.status === 'paid' && item.certificateNo && (
                                <button onClick={() => navigate(`/admin-wht-certificate/${item.id}`)}
                                  className="px-3 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold">
                                  พิมพ์ 50 ทวิ
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {isCreateOpen && (
        <DisbursementModal
          onClose={() => setIsCreateOpen(false)}
          onSaved={() => fetchAll()}
          payees={payees}
          incomeTypes={incomeTypes}
        />
      )}

      {payTarget && (
        <PayDisbursementModal
          onClose={() => setPayTarget(null)}
          onSaved={() => fetchAll()}
          disbursement={payTarget}
        />
      )}
    </div>
  );
};

export default AdminDisbursement;
