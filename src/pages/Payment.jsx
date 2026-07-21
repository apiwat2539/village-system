import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import PaymentModal from '../components/PaymentModal';
import { CreditCard, AlertCircle, CheckCircle2, Loader2, ChevronDown, ChevronRight, Inbox } from 'lucide-react';
import api from '../api/axiosConfig';
import { ENDPOINTS } from '../api/endpoints';

const statusLabel = { unpaid: 'ค้างชำระ', partial: 'ชำระบางส่วน' };

const Payment = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [paymentType, setPaymentType] = useState('monthly'); // 'monthly' หรือ 'yearly' (สำหรับชำระล่วงหน้า)
  const [showPrepay, setShowPrepay] = useState(false);

  const [summary, setSummary] = useState(null);
  const [myBills, setMyBills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // { amount, paymentType, targetBillId, label } หรือ null = ปิด modal
  const [modalConfig, setModalConfig] = useState(null);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [summaryRes, billsRes] = await Promise.all([
        api.get(ENDPOINTS.PAYMENTS.SUMMARY),
        api.get(ENDPOINTS.PAYMENTS.MY_BILLS),
      ]);
      setSummary(summaryRes.data.data || {});
      setMyBills(Array.isArray(billsRes.data.data) ? billsRes.data.data : []);
    } catch (err) {
      console.error("Fetch payment data error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const monthlyFee = summary?.monthlyFee || 0;
  const monthlyAmount = monthlyFee;
  const yearlyAmount = monthlyFee * 12;
  const prepayAmount = paymentType === 'monthly' ? monthlyAmount : yearlyAmount;
  const outstandingAmount = summary?.outstandingAmount || 0;

  const openPayBill = (bill) => {
    setModalConfig({
      amount: bill.remaining,
      paymentType: 'bill',
      targetBillId: bill.id,
      label: `ชำระ: ${bill.description}`,
    });
  };

  const openPayAll = () => {
    setModalConfig({
      amount: outstandingAmount,
      paymentType: 'outstanding',
      targetBillId: null,
      label: 'ชำระยอดค้างชำระทั้งหมด',
    });
  };

  const openPrepay = () => {
    setModalConfig({
      amount: prepayAmount,
      paymentType,
      targetBillId: null,
      label: paymentType === 'monthly' ? 'ชำระล่วงหน้ารายเดือน' : 'ชำระล่วงหน้ารายปี (12 เดือน)',
    });
  };

  const closeModal = () => {
    setModalConfig(null);
    fetchAll();
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-kanit">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="flex-1 p-4 md:p-8">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">ชำระค่าส่วนกลาง</h2>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="animate-spin mb-4" size={40} />
              <p>กำลังโหลดข้อมูล...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {/* สรุปยอดค้างชำระทั้งหมด */}
                <div className="bg-slate-800 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-6">
                      <div className="p-3 bg-white/10 rounded-2xl">
                        <CreditCard size={28} className="text-indigo-300" />
                      </div>
                      {summary?.overdueMonths > 0 && (
                        <span className="bg-amber-400 text-amber-900 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider">
                          ค้างชำระ {summary.overdueMonths} เดือน
                        </span>
                      )}
                    </div>
                    <p className="text-indigo-200 text-xs uppercase tracking-widest font-bold">ยอดค้างชำระทั้งหมด</p>
                    <h3 className="text-5xl font-black mt-2 mb-2">฿{outstandingAmount.toLocaleString()}</h3>
                    {summary?.creditBalance > 0 && (
                      <p className="text-indigo-200 text-xs mb-8">เครดิตคงเหลือ ฿{summary.creditBalance.toLocaleString()}</p>
                    )}
                    <button
                      onClick={openPayAll}
                      disabled={outstandingAmount <= 0}
                      className="w-full bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-600 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold transition shadow-lg shadow-indigo-900/20 flex items-center justify-center group mt-2"
                    >
                      {outstandingAmount > 0 ? 'ชำระยอดค้างทั้งหมด' : 'ไม่มียอดค้างชำระ'}
                      {outstandingAmount > 0 && <CheckCircle2 size={18} className="ml-2 group-hover:scale-110 transition" />}
                    </button>
                  </div>
                </div>

                {/* รายการที่ต้องชำระ (รวมบิลรายหลัง/ค่าปรับ) */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100">
                    <h4 className="font-bold text-slate-700">รายการที่ต้องชำระ</h4>
                  </div>
                  {myBills.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-300">
                      <Inbox size={32} className="mb-2" />
                      <p className="text-sm text-slate-400">ไม่มีรายการค้างชำระ</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {myBills.map((bill) => (
                        <div key={bill.id} className="flex items-center justify-between gap-4 p-5">
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 truncate">{bill.description}</p>
                            <p className="text-xs text-slate-400 mt-0.5">ครบกำหนดชำระ {bill.dueDate}</p>
                            <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              bill.status === 'partial' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-500'
                            }`}>
                              {statusLabel[bill.status] || bill.status}
                            </span>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-black text-slate-800">฿{bill.remaining.toLocaleString()}</p>
                            <button
                              onClick={() => openPayBill(bill)}
                              className="mt-2 text-xs font-bold bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition"
                            >
                              ชำระบิลนี้
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ชำระล่วงหน้า (รายเดือน/รายปี) — ตัวเลือกรอง */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  <button
                    onClick={() => setShowPrepay(!showPrepay)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left"
                  >
                    <h4 className="font-bold text-slate-500 text-sm">ชำระล่วงหน้า (รายเดือน/รายปี)</h4>
                    {showPrepay ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                  </button>

                  {showPrepay && (
                    <div className="px-6 pb-6 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div
                          onClick={() => setPaymentType('monthly')}
                          className={`cursor-pointer p-5 rounded-2xl border-2 transition ${paymentType === 'monthly'
                              ? 'border-indigo-500 bg-indigo-50/30'
                              : 'border-slate-100 hover:border-indigo-200 bg-white'
                            }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-slate-800">รายเดือน</span>
                            {paymentType === 'monthly' && <div className="w-4 h-4 rounded-full bg-indigo-500 border-4 border-white shadow-sm"></div>}
                          </div>
                          <p className="text-xs text-slate-500">ชำระ 1 เดือน</p>
                          <p className="text-xl font-black text-indigo-600 mt-2">฿{monthlyAmount.toLocaleString()}</p>
                        </div>

                        <div
                          onClick={() => setPaymentType('yearly')}
                          className={`relative cursor-pointer p-5 rounded-2xl border-2 transition ${paymentType === 'yearly'
                              ? 'border-green-500 bg-green-50/30'
                              : 'border-slate-100 hover:border-green-200 bg-white'
                            }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-slate-800">รายปี (12 เดือน)</span>
                            {paymentType === 'yearly' && <div className="w-4 h-4 rounded-full bg-green-500 border-4 border-white shadow-sm"></div>}
                          </div>
                          <p className="text-xs text-slate-500">ชำระล่วงหน้า 1 ปี</p>
                          <p className="text-xl font-black text-green-600 mt-2">฿{yearlyAmount.toLocaleString()}</p>
                        </div>
                      </div>

                      <button
                        onClick={openPrepay}
                        disabled={prepayAmount <= 0}
                        className="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-200 disabled:cursor-not-allowed text-white py-3.5 rounded-2xl font-bold transition flex items-center justify-center"
                      >
                        {prepayAmount > 0 ? `ชำระล่วงหน้า ฿${prepayAmount.toLocaleString()}` : 'ยังไม่มีอัตราค่าส่วนกลาง'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ส่วนคำแนะนำด้านข้าง */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
                  <div className="flex items-center text-slate-700 mb-4">
                    <AlertCircle size={20} className="mr-2 text-indigo-500" />
                    <h4 className="font-bold">ข้อมูลการชำระ</h4>
                  </div>
                  <ul className="text-xs text-slate-500 space-y-4">
                    <li className="flex items-start">
                      <span className="mr-2 text-indigo-300 font-bold">•</span>
                      <span>บ้านเลขที่ {summary?.houseNo || '-'} • ค่าส่วนกลาง ฿{monthlyFee.toLocaleString()}/เดือน</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-indigo-300 font-bold">•</span>
                      <span>กด "ชำระบิลนี้" เพื่อจ่ายเจาะจงรายการนั้น (เช่น ค่าปรับ) หรือ "ชำระยอดค้างทั้งหมด" เพื่อตัดจากเก่าสุดก่อน</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-indigo-300 font-bold">•</span>
                      <span>ชำระรายปีคือชำระล่วงหน้า 12 เดือน ระบบจะตัดยอดให้อัตโนมัติทุกเดือน</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <PaymentModal
          isOpen={!!modalConfig}
          onClose={closeModal}
          amount={modalConfig?.amount || 0}
          paymentType={modalConfig?.paymentType}
          targetBillId={modalConfig?.targetBillId}
          label={modalConfig?.label}
        />
      </main>
    </div>
  );
};

export default Payment;
