import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import PaymentModal from '../components/PaymentModal';
import { CreditCard, History, AlertCircle, CheckCircle2, Gift } from 'lucide-react';

const Payment = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentType, setPaymentType] = useState('monthly'); // 'monthly' หรือ 'yearly'

  const monthlyAmount = 1200;
  // สมมติว่าจ่ายรายปี 12 เดือน ลดราคาเหลือ 13,000 (จาก 14,400)
  const yearlyAmount = 13000; 

  const currentAmount = paymentType === 'monthly' ? monthlyAmount : yearlyAmount;

  return (
    <div className="flex min-h-screen bg-gray-50 font-kanit">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8">
        <Header />

        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">จัดการค่าส่วนกลาง</h2>
          
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
                    <p className="text-xs text-slate-500">ชำระปกติรายเดือน</p>
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
                    <div className="absolute -top-3 -right-2 bg-gradient-to-r from-orange-400 to-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm flex items-center">
                      <Gift size={10} className="mr-1" /> ประหยัด ฿1,400
                    </div>
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
                    <span className="bg-amber-400 text-amber-900 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider">
                      Pending Payment
                    </span>
                  </div>
                  <p className="text-indigo-200 text-xs uppercase tracking-widest font-bold">
                    {paymentType === 'monthly' ? 'ยอดค้างชำระปัจจุบัน' : 'ยอดชำระล่วงหน้า 1 ปี'}
                  </p>
                  <h3 className="text-5xl font-black mt-2 mb-8">฿{currentAmount.toLocaleString()}</h3>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="w-full bg-indigo-500 hover:bg-indigo-400 text-white py-4 rounded-2xl font-bold transition shadow-lg shadow-indigo-900/20 flex items-center justify-center group"
                  >
                    ไปที่หน้าชำระเงิน
                    <CheckCircle2 size={18} className="ml-2 group-hover:scale-110 transition" />
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
                    <span>กรุณาตรวจสอบยอดเงินให้ถูกต้องก่อนโอน</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-indigo-300 font-bold">•</span>
                    <span>ชำระรายปีจะได้รับใบเสร็จรับเงินล่วงหน้าทันทีหลังจากตรวจสอบ</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-indigo-300 font-bold">•</span>
                    <span>หากต้องการหักผ่านบัญชีอัตโนมัติ กรุณาติดต่อสำนักงาน</span>
                  </li>
                </ul>
                
                <div className="mt-8 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <p className="text-[10px] text-indigo-700 font-bold mb-1 italic">ทำไมต้องจ่ายรายปี?</p>
                  <p className="text-[10px] text-indigo-600 leading-relaxed">
                    การชำระรายปีช่วยลดภาระการทำรายการทุกเดือน และมักได้รับส่วนลดพิเศษหรือสิทธิประโยชน์ในกิจกรรมหมู่บ้าน
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        <PaymentModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          amount={currentAmount} 
          paymentType={paymentType} // ส่งประเภทไปที่ Modal เพื่อระบุในสลิป
        />
      </main>
    </div>
  );
};

export default Payment;