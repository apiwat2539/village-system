import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import PaymentModal from '../components/PaymentModal';
import { CreditCard, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import api from '../api/axiosConfig';
import { ENDPOINTS } from '../api/endpoints';

const Payment = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentType, setPaymentType] = useState('monthly'); // 'monthly' หรือ 'yearly'

  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSummary = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(ENDPOINTS.PAYMENTS.SUMMARY);
      setSummary(res.data.data || {});
    } catch (err) {
      console.error("Fetch payment summary error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const monthlyFee = summary?.monthlyFee || 0;
  const monthlyAmount = monthlyFee;          // จ่าย 1 เดือน
  const yearlyAmount = monthlyFee * 12;      // รายปี = 12 เดือน (ไม่มีส่วนลด)
  const currentAmount = paymentType === 'monthly' ? monthlyAmount : yearlyAmount;

  return (
    <div className="flex min-h-screen bg-gray-50 font-kanit">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="flex-1 p-4 md:p-8">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">จัดการค่าส่วนกลาง</h2>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="animate-spin mb-4" size={40} />
              <p>กำลังโหลดข้อมูล...</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* เลือกแพ็คเกจการชำระ */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h4 className="font-bold text-slate-700 mb-4 flex items-center">
                  <CheckCircle2 size={18} className="mr-2 text-indigo-500" />
                  เลือกรูปแบบการชำระเงิน
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* ตัวเลือกรายเดือน */}
                  <div
                    onClick={() => setPaymentType('monthly')}
                    className={`cursor-pointer p-5 rounded-2xl border-2 transition ${
                      paymentType === 'monthly'
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

                  {/* ตัวเลือกรายปี */}
                  <div
                    onClick={() => setPaymentType('yearly')}
                    className={`relative cursor-pointer p-5 rounded-2xl border-2 transition ${
                      paymentType === 'yearly'
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
              </div>

              {/* บัตรสรุปยอดชำระ */}
              <div className="bg-slate-800 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-6">
                    <div className="p-3 bg-white/10 rounded-2xl">
                      <CreditCard size={28} className="text-indigo-300" />
                    </div>
                    {summary?.outstandingAmount > 0 && (
                      <span className="bg-amber-400 text-amber-900 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider">
                        ค้างชำระ {summary.overdueMonths} เดือน
                      </span>
                    )}
                  </div>
                  <p className="text-indigo-200 text-xs uppercase tracking-widest font-bold">
                    {paymentType === 'monthly' ? 'ยอดที่จะชำระ (รายเดือน)' : 'ยอดชำระล่วงหน้า 1 ปี'}
                  </p>
                  <h3 className="text-5xl font-black mt-2 mb-2">฿{currentAmount.toLocaleString()}</h3>
                  <p className="text-indigo-200 text-xs mb-8">
                    ยอดค้างชำระปัจจุบัน ฿{(summary?.outstandingAmount || 0).toLocaleString()}
                    {summary?.creditBalance > 0 && ` • เครดิตคงเหลือ ฿${summary.creditBalance.toLocaleString()}`}
                  </p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    disabled={currentAmount <= 0}
                    className="w-full bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-600 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold transition shadow-lg shadow-indigo-900/20 flex items-center justify-center group"
                  >
                    {currentAmount > 0 ? 'ไปที่หน้าชำระเงิน' : 'ยังไม่มีอัตราค่าส่วนกลาง'}
                    {currentAmount > 0 && <CheckCircle2 size={18} className="ml-2 group-hover:scale-110 transition" />}
                  </button>
                </div>
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
                    <span>กรุณาตรวจสอบยอดเงินให้ถูกต้องก่อนโอน</span>
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
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); fetchSummary(); }}
          amount={currentAmount}
          paymentType={paymentType}
        />
      </main>
    </div>
  );
};

export default Payment;
